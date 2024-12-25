import { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { Octokit } from '@octokit/rest';

export const config = {
  api: {
    bodyParser: false,
  },
};

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const form = formidable();
    const [fields, files] = await form.parse(req);
    
    const file = files.image?.[0];
    if (!file) {
      return res.status(400).json({ message: 'No image uploaded' });
    }

    // Create ArtworkNEW directory if it doesn't exist
    const uploadDir = path.join(process.cwd(), 'public', 'ArtworkNEW');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Generate filename and copy file
    const ext = path.extname(file.originalFilename || '');
    const filename = `${Date.now()}${ext}`;
    const newPath = path.join(uploadDir, filename);
    await fs.promises.copyFile(file.filepath, newPath);

    // Read index.html from GitHub
    const { data: indexFile } = await octokit.repos.getContent({
      owner: process.env.GITHUB_OWNER!,
      repo: process.env.GITHUB_REPO!,
      path: 'index.html',
      ref: 'main'
    });

    if (!('content' in indexFile)) {
      throw new Error('Unable to get index.html content');
    }

    const htmlContent = Buffer.from(indexFile.content, 'base64').toString();

    // Create new work HTML
    const twitterHandle = fields.twitterHandle?.[0] || '';
    const twitterUrl = `https://x.com/${twitterHandle}/status/${fields.twitterId?.[0] || ''}`;
    const newWorkHtml = `
                                <div class="folio-item work-item dsn-col-md-2 dsn-col-lg-3 ${fields.category?.[0] || 'illustration'} column" data-aos="fade-up">
                                    <div class="has-popup box-img before-z-index z-index-0 p-relative over-hidden folio-item__thumb"
                                        data-overlay="0">
                                        <a class="folio-item__thumb-link" target="blank" href="assets/Artworks NEW/${filename}" title="${fields.title?.[0]}" data-size="905x1280">
                                            <img class="cover-bg-img" src="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==" data-dsn-src="assets/Artworks NEW/${filename}" alt="${fields.title?.[0]}">
                                        </a>
                                    </div>
   
                                    <div class="folio-item__info">
                                        <div class="folio-item__cat">${fields.category?.[0] || 'illustration'}/${fields.subcategory?.[0] || ''} ${new Date().getFullYear()}</div>
                                        <h4 class="folio-item__title">${fields.title?.[0]}</h4>
                                    </div>
                                    <a target="blank" href="${twitterUrl}" title="Twitter" class="folio-item__project-link">Twitter</a>
                                    <div class="folio-item__caption">
                                        <p>Twitter</p>
                                    </div>
                                </div>`;

    // Find the gallery-section and insert the new work at the beginning
    const galleryRegex = /(id="work"[^>]*>)([\s\S]*?)(<\/div><!-- \.portfolio-inner -->)/;
    const updatedHtmlContent = htmlContent.replace(
      galleryRegex,
      `$1\n${newWorkHtml}$2$3`
    );

    // Write updated HTML back to GitHub
    await octokit.repos.createOrUpdateFileContents({
      owner: process.env.GITHUB_OWNER!,
      repo: process.env.GITHUB_REPO!,
      path: 'index.html',
      message: 'Add new work',
      content: Buffer.from(updatedHtmlContent).toString('base64'),
      sha: indexFile.sha,
      branch: 'main'
    });

    res.status(200).json({ message: 'Upload successful' });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Upload failed' });
  }
}
