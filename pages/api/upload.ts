import { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import { Octokit } from '@octokit/rest';
import fs from 'fs/promises';
import path from 'path';

export const config = {
  api: {
    bodyParser: false,
  },
};

interface GitHubContent {
  content: string;
  sha: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const octokit = new Octokit({
    auth: process.env.GITHUB_PAT 
  });

  try {
    // Parse form data
    const form = formidable();
    form.parse(req, async (err, fields, files) => {
      if (err) {
        return res.status(500).json({ message: 'Error parsing form data' });
      }

      // Type assertion and validation
      const uploadedFile = files.file?.[0] || files.file;
      if (!uploadedFile || !uploadedFile.filepath) {
        return res.status(400).json({ message: 'No valid file uploaded' });
      }

      try {
        const imageBuffer = await fs.readFile(uploadedFile.filepath);
        const filename = uploadedFile.originalFilename || 'image.jpg';

        // Construct Twitter URL if available
        let twitterUrl = '';
        if (fields.twitterId?.[0] && fields.twitterHandle?.[0]) {
          twitterUrl = `https://twitter.com/${fields.twitterHandle[0]}/status/${fields.twitterId[0]}`;
        } else if (fields.twitterLink?.[0]) {
          twitterUrl = fields.twitterLink[0];
        }

        // Check if the image file already exists
        let imageSha: string | undefined;
        try {
          const { data: existingImage } = await octokit.repos.getContent({
            owner: process.env.GITHUB_OWNER || '',
            repo: process.env.GITHUB_REPO || '',
            path: `assets/Artworks NEW/${filename}`
          }) as { data: GitHubContent };
          imageSha = existingImage.sha;
        } catch (error) {
          // File doesn't exist, proceed without sha
        }

        // Upload image to GitHub
        await octokit.repos.createOrUpdateFileContents({
          owner: process.env.GITHUB_OWNER || '',
          repo: process.env.GITHUB_REPO || '',
          path: `public/assets/Artworks NEW/${filename}`,
          message: 'Upload new artwork',
          content: imageBuffer.toString('base64'),
          sha: imageSha
        });

        // Get current index.html content
        const { data: fileData } = await octokit.repos.getContent({
          owner: process.env.GITHUB_OWNER || '',
          repo: process.env.GITHUB_REPO || '',
          path: 'index.html',
        }) as { data: GitHubContent };

        const currentContent = Buffer.from(fileData.content, 'base64').toString();

        // Construct new artwork HTML
        const newWorkHtml = `
          <div class="folio-item work-item dsn-col-md-2 dsn-col-lg-3 ${fields.category?.[0] || 'illustration'} column" data-aos="fade-up">
            <div class="has-popup box-img before-z-index z-index-0 p-relative over-hidden folio-item__thumb" data-overlay="0">
              <a class="folio-item__thumb-link" target="_blank" href="assets/Artworks NEW/${filename}" data-size="905x1280">
                <img class="cover-bg-img" src="assets/Artworks NEW/${filename}" alt="${fields.title?.[0]}">
              </a>
            </div>
            <div class="folio-item__info">
              <div class="folio-item__cat">${fields.category?.[0] || 'illustration'}/${fields.subcategory?.[0] || ''} ${new Date().getFullYear()}</div>
              <h4 class="folio-item__title">${fields.title?.[0]}</h4>
            </div>
            ${twitterUrl ? `
            <a target="_blank" href="${twitterUrl}" title="Twitter" class="folio-item__project-link">Twitter</a>
            <div class="folio-item__caption">
              <p>Twitter</p>
            </div>` : ''}
          </div>`;

        // Update the regex pattern to target gallery-section div
        const galleryRegex = /(id="gallery-section"[^>]*>)([\s\S]*?)(<\/div>)/;

        // Modify the HTML insertion to add at the start of gallery-section
        const updatedContent = currentContent.replace(
          galleryRegex,
          (match, openingTag, content, closingTag) => {
            return `${openingTag}
            ${newWorkHtml}
            ${content}${closingTag}`;
          }
        );

        // Save locally
        const localDir = path.join(process.cwd(), 'saved-html');
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const localPath = path.join(localDir, `index-${timestamp}.html`);

        // Create directory if it doesn't exist
        await fs.mkdir(localDir, { recursive: true });
        
        // Save the file
        await fs.writeFile(localPath, updatedContent);
        
        console.log(`Saved local copy to: ${localPath}`);
        console.log('Successfully pushed updated index.html to GitHub');

        res.status(200).json({ message: 'Upload successful', localPath });
      } catch (error) {
        console.error('Error during upload:', error);
        res.status(500).json({ message: 'Upload failed', error });
      }
    });
  } catch (error) {
    console.error('Error during upload:', error);
    res.status(500).json({ message: 'Upload failed', error });
  }
}
