import axios, { type AxiosError } from 'axios';
import { Request, Response } from 'express';
import { config } from '../config';

const gistsBaseUrl = 'https://api.github.com/gists';
const headers = {
  'X-GitHub-Api-Version': '2022-11-28',
  Authorization: 'Bearer ' + config.api.github,
};

async function get(req: Request, res: Response) {
  try {
    const { data } = await axios.get(`${gistsBaseUrl}/${req.params.id}`, {
      headers,
    });

    res.status(200).json({
      success: true,
      data,
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

async function create(req: Request, res: Response) {
  try {
    const { description, filename, content, public: isGistPublic } = req.body;

    const { data } = await axios.post(
      gistsBaseUrl,
      {
        description,
        public: isGistPublic,
        files: {
          [filename]: { content },
        },
      },
      { headers },
    );

    res.status(200).json({
      success: true,
      data,
    });
  } catch {
    res.status(500).json({
      success: false,
      message: 'Something went wrong',
    });
  }
}

async function update(req: Request, res: Response) {
  try {
    const { filename, content } = req.body;

    await axios.patch(
      `${gistsBaseUrl}/${req.params.id}`,
      {
        files: {
          [filename]: { content },
        },
      },
      { headers },
    );

    res.status(200).json({
      success: true,
      message: 'Gist updated',
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

async function del(req: Request, res: Response) {
  try {
    await axios.delete(`${gistsBaseUrl}/${req.params.id}`, {
      headers,
    });

    res.status(200).json({
      success: true,
      message: 'Gist deleted',
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

export { get, create, del, update };
