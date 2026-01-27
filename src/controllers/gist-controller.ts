/* eslint-disable @typescript-eslint/no-unused-vars */
import axios, { type AxiosError } from 'axios';
import { Request, Response } from 'express';
import { IGistCommitItem } from '../interfaces/gist-commit-item';
import { IGistFile } from '../interfaces/gist-file';
import { gistsBaseUrl, headers } from '../constants/gist-constants';
import { GistService } from '../services/gist-service';

async function get(req: Request, res: Response) {
  try {
    const { data } = await axios.get(`${gistsBaseUrl}/${req.params.id}`, {
      headers,
    });

    const {
      owner,
      history,
      forks,
      user,
      url,
      forks_url,
      commits_url,
      git_pull_url,
      git_push_url,
      html_url,
      comments_url,
      ...rest
    } = data;

    const cleanedFiles = Object.fromEntries(
      Object.entries(rest.files as Record<string, IGistFile>).map(
        ([filename, { raw_url, ...fileWithoutRaw }]) => [filename, fileWithoutRaw],
      ),
    );

    res.status(200).json({
      success: true,
      data: { ...rest, files: cleanedFiles },
    });
  } catch (e) {
    console.error(e);
    if ((e as AxiosError).status === 404) {
      res.status(404).json({
        success: false,
        message: 'Gist not found',
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Something went wrong',
      });
    }
  }
}

async function create(req: Request, res: Response) {
  try {
    const { description, filename, content, public: isGistPublic } = req.body;

    const { data } = await axios.post(
      gistsBaseUrl,
      {
        description: description || '',
        public: isGistPublic || false,
        files: {
          [filename]: { content },
        },
      },
      { headers },
    );

    const returnData = {
      id: data.id,
      files: data.files,
    };

    res.status(200).json({
      success: true,
      data: returnData,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({
      success: false,
      message: 'Something went wrong',
    });
  }
}

async function update(req: Request, res: Response) {
  try {
    const { filename, content } = req.body;

    const { data } = await axios.patch(
      `${gistsBaseUrl}/${req.params.id}`,
      {
        files: {
          [filename]: { content },
        },
      },
      { headers },
    );

    let deleted = false;
    if (!Object.entries(data.files).length) {
      GistService.deleteGist(req.params.id);
      deleted = true;
    }

    res.status(200).json({
      deleted,
      success: true,
      message: 'Gist updated',
    });
  } catch (e) {
    console.error(e);
    if ((e as AxiosError).status === 404) {
      res.status(404).json({
        success: false,
        message: 'Gist not found',
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Something went wrong',
      });
    }
  }
}

async function del(req: Request, res: Response) {
  try {
    GistService.deleteGist(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Gist deleted',
    });
  } catch (e) {
    console.error(e);
    if ((e as AxiosError).status === 404) {
      res.status(404).json({
        success: false,
        message: 'Gist not found',
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Something went wrong',
      });
    }
  }
}

async function getCommits(req: Request, res: Response) {
  try {
    const page = req.query.page ? parseInt(req.query.page as string) : undefined;
    const perPage = req.query.per_page ? parseInt(req.query.per_page as string) : undefined;
    const data = await GistService.getCommits(req.params.id, perPage, page);

    const cleanData = data.map((x: IGistCommitItem) => {
      const { user, url, ...rest } = x;
      return rest;
    });

    res.status(200).json({
      success: true,
      data: cleanData,
    });
  } catch (e) {
    if ((e as AxiosError).status === 404) {
      res.status(404).json({
        success: false,
        message: 'Gist not found',
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Something went wrong',
      });
    }
  }
}

async function getRevision(req: Request, res: Response) {
  try {
    const data = await GistService.getCommit(req.params.id, req.params.sha);

    const {
      owner,
      history,
      forks,
      user,
      url,
      forks_url,
      commits_url,
      git_pull_url,
      git_push_url,
      html_url,
      comments_url,
      ...rest
    } = data;

    const cleanedFiles = Object.fromEntries(
      Object.entries(rest.files as Record<string, IGistFile>).map(
        ([filename, { raw_url, ...fileWithoutRaw }]) => [filename, fileWithoutRaw],
      ),
    );

    res.status(200).json({
      success: true,
      data: { ...rest, files: cleanedFiles },
    });
  } catch (e) {
    if ((e as AxiosError).status === 404) {
      res.status(404).json({
        success: false,
        message: 'Gist not found',
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Something went wrong',
      });
    }
  }
}

async function getRevisionsForFile(req: Request, res: Response) {
  try {
    const gistId = req.params.id;
    const file = req.params.file;

    const cursor = req.query.cursor as string;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;

    const batchSize = Math.max(limit * 2, 50);
    let page = 1;
    let startProcessing = !cursor;

    const versionsWithChanges: IGistCommitItem[] = [];
    let hasMore = true;
    let nextCursor: string | null = null;

    while (versionsWithChanges.length < limit && hasMore) {
      const commitsBatch = await GistService.getCommits(gistId, batchSize, page);

      if (commitsBatch.length === 0) {
        hasMore = false;
        break;
      }

      for (let i = 0; i < commitsBatch.length && versionsWithChanges.length < limit; i++) {
        const currentCommit = commitsBatch[i];

        if (!startProcessing) {
          if (currentCommit.version === cursor) {
            startProcessing = true;
          }
          continue;
        }

        if (versionsWithChanges.length === 0) {
          const version = await GistService.getCommit(gistId, currentCommit.version);
          if (version.files[file]) {
            versionsWithChanges.push(currentCommit);
          }
          continue;
        }

        const lastAddedCommit = versionsWithChanges[versionsWithChanges.length - 1];

        try {
          const [lastVersion, currentVersion] = await Promise.all([
            GistService.getCommit(gistId, lastAddedCommit.version),
            GistService.getCommit(gistId, currentCommit.version),
          ]);

          if (!currentVersion.files[file]) {
            break;
          }

          if (!lastVersion.files[file]) {
            versionsWithChanges.push(currentCommit);
            continue;
          }

          const lastContent = lastVersion.files[file].content;
          const currentContent = currentVersion.files[file].content;

          if (lastContent !== currentContent) {
            versionsWithChanges.push(currentCommit);
          }
        } catch (error) {
          console.error(`Error comparing versions:`, error);
          versionsWithChanges.push(currentCommit);
        }
      }

      if (commitsBatch.length < batchSize) {
        hasMore = false;
      } else {
        page++;
      }
    }

    if (versionsWithChanges.length === limit) {
      nextCursor = versionsWithChanges[versionsWithChanges.length - 1].version;
    }

    const versions = versionsWithChanges.map((v: IGistCommitItem) => {
      const { user, url, ...rest } = v;
      return rest;
    });

    res.status(200).json({
      success: true,
      data: versions,
      pagination: {
        cursor: nextCursor,
        hasMore: nextCursor !== null,
        limit,
        count: versions.length,
      },
    });
  } catch (e) {
    if ((e as AxiosError).status === 404) {
      res.status(404).json({
        success: false,
        message: 'Gist not found',
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Something went wrong',
      });
    }
  }
}

async function compare(req: Request, res: Response) {
  try {
    const { id, file, versionA, versionB } = req.params;

    const dataA = await GistService.getCommit(id, versionA);
    let dataB = {
      files: {
        [file]: { content: '' },
      },
    };

    if (versionB !== 'null') {
      dataB = await GistService.getCommit(id, versionB);
    }

    res.status(200).json({
      success: true,
      data: {
        contentA: dataA.files[file]?.content || '',
        contentB: dataB.files[file]?.content || '',
      },
    });
  } catch (e) {
    if ((e as AxiosError).status === 404) {
      res.status(404).json({
        success: false,
        message: 'Gist or file not found',
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Something went wrong',
      });
    }
  }
}

export { get, create, del, update, getCommits, getRevision, getRevisionsForFile, compare };
