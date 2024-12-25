import { NextApiRequest, NextApiResponse } from 'next';
import { Octokit } from '@octokit/rest';
import formidable from 'formidable';
import fs from 'fs';

export const config = {
  api: {
    bodyParser: false,
  },
};

// Add type for GitHub content response
type GitHubContent = {
  type: "file";
  content: string;
  sha: string;
  // ... other properties
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const octokit = new Octokit({
    auth: process.env.GITHUB_PAT
  });

  try {
    const form = formidable();
    const [fields, files] = await form.parse(req);
    
    const file = files.image?.[0];
    if (!file) {
      return res.status(400).json({ message: 'No image uploaded' });
    }

    // Read file content
    const imageContent = await fs.promises.readFile(file.filepath, { encoding: 'base64' });
    const filename = `${Date.now()}${file.originalFilename?.substring(file.originalFilename.lastIndexOf('.'))}`;

    // 1. Upload image to correct path
    await octokit.repos.createOrUpdateFileContents({
      owner: process.env.GITHUB_OWNER!,
      repo: process.env.GITHUB_REPO!,
      path: `assets/Artworks NEW/${filename}`, // Fixed path
      message: `Upload artwork: ${fields.title?.[0]}`,
      content: imageContent,
      branch: 'main'
    });

    // 2. Get current index.html content with proper typing
    const { data: indexFile } = await octokit.repos.getContent({
      owner: process.env.GITHUB_OWNER!,
      repo: process.env.GITHUB_REPO!,
      path: 'index.html',
      ref: 'main'
    }) as { data: GitHubContent };  // Add type assertion here

    // Log the fetched index.html content
    console.log('Fetched index.html content:', indexFile);

    if (!('content' in indexFile) || !('sha' in indexFile)) {
      throw new Error('Invalid index.html file data');
    }

    // 3. Create new work HTML with correct image path
    const twitterHandle = fields.twitterHandle?.[0] || '';
    const twitterUrl = `https://x.com/${twitterHandle}/status/${fields.twitterId?.[0] || ''}`;
    
    const newWorkHtml = `
      <div class="folio-item work-item dsn-col-md-2 dsn-col-lg-3 ${fields.category?.[0] || 'illustration'} column" data-aos="fade-up">
        <div class="has-popup box-img before-z-index z-index-0 p-relative over-hidden folio-item__thumb" data-overlay="0">
          <a class="folio-item__thumb-link" target="blank" href="assets/Artworks NEW/${filename}" data-size="905x1280">
            <img class="cover-bg-img" src="assets/Artworks NEW/${filename}" alt="${fields.title?.[0]}">
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

    // Log the new work HTML
    console.log('New work HTML:', newWorkHtml);

    // 4. Update index.html with proper content decoding
    const htmlContent = Buffer.from(indexFile.content, 'base64').toString();
    const galleryRegex = /(id="work"[^>]*>)([\s\S]*?)(<\/div><!-- \.portfolio-inner -->)/;
    const updatedHtmlContent = htmlContent.replace(galleryRegex, `$1\n${newWorkHtml}$2$3`);

    // Log the updated index.html content
    console.log('Updated index.html content:', updatedHtmlContent);

    await octokit.repos.createOrUpdateFileContents({
      owner: process.env.GITHUB_OWNER!,
      repo: process.env.GITHUB_REPO!,
      path: 'index.html',
      message: `Update index.html with new artwork: ${fields.title?.[0]}`,
      content: Buffer.from(updatedHtmlContent).toString('base64'),
      sha: indexFile.sha, // Add this line
      branch: 'main'
    });

    res.status(200).json({ message: 'Upload successful' });
  } catch (error) {
    console.error('Upload error:', error);
    console.error('Error details:', {
      message: error.message,
      status: error.status,
      response: error.response?.data
    });
    res.status(500).json({ 
      message: 'Upload failed', 
      error: error.message,
      details: error.response?.data 
    });
  }
}
