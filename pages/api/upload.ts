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

  if (!process.env.GITHUB_PAT) {
    console.error('GitHub PAT not configured');
    return res.status(500).json({ message: 'GitHub authentication not configured' });
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

      // Check password
      if (!fields.password || fields.password[0] !== process.env.UPLOAD_PASSWORD) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      // Type assertion and validation
      const uploadedFile = Array.isArray(files.file) ? files.file[0] : files.file;
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
            path: `public/img/art/${filename}`
          }) as { data: GitHubContent };
          imageSha = existingImage.sha;
        } catch (error) {
          // File doesn't exist, proceed without sha
        }

        // Upload image to GitHub
        await octokit.repos.createOrUpdateFileContents({
          owner: process.env.GITHUB_OWNER || '',
          repo: process.env.GITHUB_REPO || '',
          path: `public/art/${filename}`,
          message: '[skip deploy] Upload new artwork',
          content: imageBuffer.toString('base64'),
          sha: imageSha
        });

        // Get current portfolio.js content
        const { data: fileData } = await octokit.repos.getContent({
          owner: process.env.GITHUB_OWNER || '',
          repo: process.env.GITHUB_REPO || '',
          path: 'data/portfolio.js',
        }) as { data: GitHubContent };

        const currentContent = Buffer.from(fileData.content, 'base64').toString();

        // Generate ID (usually the highest current ID + 1)
        const idMatch = currentContent.match(/id:\s*(\d+)/g);
        let nextId = 1;
        if (idMatch) {
          const ids = idMatch.map(match => parseInt(match.replace('id:', '').trim()));
          nextId = Math.max(...ids) + 1;
        }

        // Parse categories
        const mainCategory = fields.category231?.[0] || 'illustration';
        const subCategory = fields.subcategory?.[0] || '';
        const categories = [mainCategory];
        if (subCategory) categories.push(subCategory);

        // Create new portfolio item
        const newPortfolioItem = `
    {
        id: ${nextId},
        title: "${fields.title?.[0] || 'New Artwork'}",
        link: '${twitterUrl || ''}',
        isExternal: ${Boolean(twitterUrl)},
        category: [${categories.map(c => `'${c}'`).join(', ')}],
        description: '${fields.description?.[0] || ''}',
        src: 'public/art/${filename}',
        overlay: 6
    },`;

        // Add the new portfolio item to the existing content
        const updatedContent = currentContent.replace(
          /const data\s*=\s*\[/,
          `const data = [\n${newPortfolioItem}`
        );

        // Push to GitHub
        await octokit.repos.createOrUpdateFileContents({
          owner: process.env.GITHUB_OWNER || '',
          repo: process.env.GITHUB_REPO || '',
          path: 'data/portfolio.js',
          message: '[deploy] Add new artwork to portfolio', 
          content: Buffer.from(updatedContent).toString('base64'),
          sha: fileData.sha,
        });

        // Log success with more detail
        console.log('✅ Changes pushed to GitHub. Build status:', {
          imageUploaded: true,
          portfolioUpdated: true,
          deployTriggered: true
        });

        res.status(200).json({ 
          message: 'Upload successful',
          github: true
        });

      } catch (error) {
        console.error('❌ Upload failed:', error);
        res.status(500).json({ 
          message: 'Upload failed', 
          error: error.message
        });
      }
    });
  } catch (error) {
    console.error('Error during upload:', error);
    res.status(500).json({ message: 'Upload failed', error });
  }
}
