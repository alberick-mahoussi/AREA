import { Injectable, Inject, forwardRef, Body } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Area } from '@prisma/client';
import axios from 'axios';
import { ConnectDbService } from 'src/connect-db/connect-db.service';
import { MailService } from '../mail/mail.service';
import { NotionService } from '../notion/notion.service';
import { Gitlab } from '@gitbeaker/node';
import { DiscordService } from '../discord/discord.service';
import { GithubService } from '../github/github.service';
import { MicrosoftService } from '../microsoft/microsoft.service';
import { SpotifyService } from '../spotify/spotify.service';
import { GoogleService } from '../google/google.service';

@Injectable()
export class GitlabService {
  constructor(
    @Inject(forwardRef(() => GithubService))
    private githubService: GithubService,
    private config: ConfigService,
    private db: ConnectDbService,
    private mail: MailService,
    @Inject(forwardRef(() => MicrosoftService))
    private outlook: MicrosoftService,
    @Inject(forwardRef(() => NotionService))
    private notion: NotionService,
    // @Inject(forwardRef(() => DiscordService))
    private discord: DiscordService,
    private spotify: SpotifyService,
    private google: GoogleService
  ) {}

  async launchGitlab(access_token: string) {
    return  new Gitlab({
      token: access_token,
    });
  }

  public async findProjectIdByName(
    projectName: string,
    access_token: string,
  ): Promise<number | null> {
    const git = this.launchGitlab(access_token);
    if (!git) {
      console.log('GitLab API client not initialized.');
      return 84
    }

    try {
      const projects = (await git).Projects.all({ search: projectName });
      const project = (await projects).find((p) => p.name === projectName);
      return project ? project.id : null;
    } catch (error) {
      console.log(`Failed to find project ID by name: ${error.message}`);
      return 84
    }
  }

 
  async NewRepository(access_token: string, project_name: string) {
    try {
      const apiUrl = 'https://gitlab.com/api/v4/projects'
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${access_token}`,
      };
  
      const project = await axios.post(apiUrl, { name: project_name }, { headers });
  
      return project.data;
    } catch (error) {
      console.error('Error creating project:', error.response?.data || error.message);
      throw new Error('Unable to create project.');
    }
  }

  async createTag(projectName: string, tagName: string, ref: string, access_token: string): Promise<any> {
    try {
      const projectUrl = `https://gitlab.com/api/v4/projects?search=${projectName}`;
      const headers = {
        'Authorization': `Bearer ${access_token}`,
      };

      const projectResponse = await axios.get(projectUrl, { headers });
      const project = projectResponse.data.find((p: any) => p.name === projectName);

      if (!project) {
        throw new Error(`Project '${projectName}' not found.`);
      }

      const projectId = project.id;

      const tagUrl = `https://gitlab.com/api/v4/projects/${projectId}/repository/tags`;
      const tagData = {
        tag_name: tagName,
        ref,
      };

      const tagResponse = await axios.post(tagUrl, tagData, { headers });

      return tagResponse.data;
    } catch (error) {
      console.error(`Failed to create tag: ${error.response?.data || error.message}`);
      throw new Error(`Failed to create tag: ${error.message}`);
    }
  }
  
  async createIssue(projectName: string, title: string, access_token: string, description?: string): Promise<any> {
    try {
      const projectUrl = `https://gitlab.com/api/v4/projects?search=${projectName}`;
      const headers = {
        'Authorization': `Bearer ${access_token}`,
      };

      const projectResponse = await axios.get(projectUrl, { headers });
      const project = projectResponse.data.find((p: any) => p.name === projectName);

      if (!project) {
        throw new Error(`Project '${projectName}' not found.`);
      }

      const projectId = project.id;


      const issueUrl = `https://gitlab.com/api/v4/projects/${projectId}/issues`;
      const issueData = {
        title,
        description,
      };

      const issueResponse = await axios.post(issueUrl, issueData, { headers });

      return issueResponse.data;
    } catch (error) {
      console.error(`Failed to create an issue: ${error.response?.data || error.message}`);
      throw new Error(`Failed to create an issue: ${error.message}`);
    }
  }

  async deleteIssue(projectName: string, issueId: number, access_token: string): Promise<any> {
    try {
      const projectUrl = `https://gitlab.com/api/v4/projects?search=${projectName}`;
      const headers = {
        'Authorization': `Bearer ${access_token}`,
      };

      const projectResponse = await axios.get(projectUrl, { headers });
      const project = projectResponse.data.find((p: any) => p.name === projectName);

      if (!project) {
        throw new Error(`Project '${projectName}' not found.`);
      }

      const projectId = project.id;

      const issueUrl = `https://gitlab.com/api/v4/projects/${projectId}/issues/${issueId}`;
      await axios.delete(issueUrl, { headers });

      return { status: 'success', message: 'Issue deleted successfully' };
    } catch (error) {
      console.error(`Failed to delete the issue: ${error.response?.data || error.message}`);
      throw new Error(`Failed to delete the issue: ${error.message}`);
    }
  }

  async createBranch(projectName: string, branchName: string, ref: string, access_token: string): Promise<any> {
    try {
      const projectUrl = `https://gitlab.com/api/v4/projects?search=${projectName}`;
      const headers = {
        'Authorization': `Bearer ${access_token}`,
      };

      const projectResponse = await axios.get(projectUrl, { headers });
      const project = projectResponse.data.find((p: any) => p.name === projectName);

      if (!project) {
        throw new Error(`Project '${projectName}' not found.`);
      }

      const projectId = project.id;

      const branchUrl = `https://gitlab.com/api/v4/projects/${projectId}/repository/branches`;
      const branchData = {
        branch: branchName,
        ref,
      };

      const branchResponse = await axios.post(branchUrl, branchData, { headers });

      return branchResponse.data;
    } catch (error) {
      console.error(`Failed to create a branch: ${error.response?.data || error.message}`);
      throw new Error(`Failed to create a branch: ${error.message}`);
    }
  }

  async deleteBranch(projectName: string, branchName: string, access_token: string): Promise<any> {
    try {
      const projectUrl = `https://gitlab.com/api/v4/projects?search=${projectName}`;
      const headers = {
        'Authorization': `Bearer ${access_token}`,
      };

      const projectResponse = await axios.get(projectUrl, { headers });
      const project = projectResponse.data.find((p: any) => p.name === projectName);

      if (!project) {
        throw new Error(`Project '${projectName}' not found.`);
      }

      const projectId = project.id;

      const branchUrl = `https://gitlab.com/api/v4/projects/${projectId}/repository/branches/${branchName}`;
      await axios.delete(branchUrl, { headers });

      return { status: 'success', message: 'Branch deleted successfully' };
    } catch (error) {
      console.error(`Failed to delete the branch: ${error.response?.data || error.message}`);
      throw new Error(`Failed to delete the branch: ${error.message}`);
    }
  }

  async ReactionGitlab(area: Area) {
    console.log(area.UserId);
    const service = await this.db.service.findFirstOrThrow({
      where: {
        NameService: area.Reaction_Service,
        UserId: area.UserId
      }
    })
    console.log(service.NameService, service.UserId, service.TokenId)
    const token = await this.db.token.findUnique({
      where: {
        id: service.TokenId
      }
    })


    switch (area.ReactionId) {
      case 0:
        this.NewRepository(token.Token, area.ReactionParam[0])
      break
      case 1:
        this.createTag(area.ReactionParam[0], area.ReactionParam[1], area.ReactionParam[2], token.Token)
      break
      case 2:
        this.createIssue(area.ReactionParam[0], area.ReactionParam[1], token.Token, area.ReactionParam[2])
      break
      case 3:
        this.deleteIssue(area.ReactionParam[0], parseInt(area.ReactionParam[1], 10), token.Token)
      break;
      case 4:
        this.createBranch(area.ReactionParam[0], area.ReactionParam[1], area.ReactionParam[2], token.Token)
      break
      case 5:
        this.deleteBranch(area.ReactionParam[0], area.ReactionParam[1], token.Token)
      break;
    }
  }
  
  async exchangeCodeForToken(AutherizationCode: string): Promise<string> {
    try {
      const data = {
        client_id: this.config.get('GITLAB_CLIENT_ID'),
        client_secret: this.config.get('GITLAB_SECRET_ID'),
        code: AutherizationCode,
        grant_type: 'authorization_code',
        redirect_uri: 'http://localhost:8081/gitlab',
      };

      const tokenResponse = await axios.post(
        'https://gitlab.com/oauth/token',
        new URLSearchParams(data),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      );
      const queryParams = new URLSearchParams(tokenResponse.data);
      const accessToken = queryParams.get('access_token');

      if (!accessToken) {
        console.log('Access token not found in the response');
      }
      return accessToken;
    } catch (error: any) {
      console.error(
        "Erreur lors de l'échange du code contre le token :",
        error.message,
        error.response?.data?.error_description,
      );
      console.log("Erreur lors de l'échange du code contre le token");
    }
  }

  async getUserInfo(accessToken: string): Promise<any> {
    try {
      const userInfoResponse = await axios.get(
        'https://gitlab.com/api/v4/user/',
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      return userInfoResponse.data;
    } catch (error) {
      console.error(
        "Erreur lors de la récupération des informations de l'utilisateur :",
        error,
      );
    }
  }

  async InformationOnWebhookAction(action: string, body: any): Promise<string> {
    const repoName = body.project.name;
    const repoOwner = body.project.namespace;
    const username = body.user_name;
    let actionMessage = '';

    switch (action) {
      case 'push':
        actionMessage = 'pushed code to';
        break;
      case 'merge_request':
        if (body.object_attributes.state === 'opened')
          actionMessage = 'created a pull request on';
        else if (body.object_attributes.state === 'closed')
          actionMessage = 'closed a pull request on';
        else if (body.object_attributes.state === 'updated')
          actionMessage = 'updated a pull request on';
        break;
      case 'issues':
        if (body.object_attributes.state === 'opened')
          actionMessage = 'created an issue on';
        else if (body.object_attributes.state === 'closed')
          actionMessage = 'closed an issue on';
        break;
      case 'tag_push':
        actionMessage = 'Tag on specific branch';
      default:
        actionMessage = 'performed an unknown action on';
    }


    return `${username} ${actionMessage} the repository ${repoName} owned by ${repoOwner}`;
  }

  async addGitlabWebhook(projectName: string, accessToken: string): Promise<any> {
    
    const webhookURL = 'https://redfish-robust-roughly.ngrok-free.app/gitlab/webhook'
  
    const gitlabApiUrl = 'https://gitlab.com/api/v4';
    const apiUrl = `${gitlabApiUrl}/projects/${encodeURIComponent(projectName)}/hooks`;
  
    try {
      const response = await axios.post(
        apiUrl,
        {
          url: webhookURL,
          push_events: true,
          merge_requests_events: true,
          issues_events: true,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );
  
    } catch (error) {
      console.error("Erreur lors de l'ajout du webhook GitLab :", error.response?.data || error.message);
      return error;
    }
  }

  async reactionController(action: string, area: Area, Body: any) {
    const reaction: string = area.Reaction_Service;

    switch (reaction) {
      case 'Mail':
        this.mail.sendEmail(
          await this.InformationOnWebhookAction(action, Body),
          area,
        );
        break;
      case 'Discord':
        this.discord.ReactionDiscord(await this.InformationOnWebhookAction(action, Body), area);
        break;
      case 'Notion':
        this.notion.ReactionNotion(await this.InformationOnWebhookAction(action, Body), area)
        break;
      case 'Github':
        this.githubService.ReactionGitHub(area);
        break;
      case 'Gitlab':
        this.ReactionGitlab(area);
        break;
      case 'Gmail':
        this.google.ReactionGmail(area)
        break;
      case 'Google Calendar':
        this.google.ReactionEventCalendar(area)
        break;
      case 'Microsoft':
        this.outlook.ReactionOutlook(area);
        break;
      case 'Spotify':
        this.spotify.ReactionSpotify(await this.InformationOnWebhookAction(action, Body), area)
        break;
    }
  }

  SearchAction(area: Area, event: string, body: any) {
    switch (event) {
      case 'push':
        console.log('push action gitlab');
        if (area.Action_id === 0) this.reactionController(event, area, body);
        break;
      case 'issue':
        console.log('issue action gitlab');
        if (area.Action_id === 6 && body.object_attributes.state === 'closed')
          this.reactionController(event, area, body);
        else if (
          area.Action_id === 5 &&
          body.object_attributes.state === 'opened'
        )
          this.reactionController(event, area, body);
        else if (
          area.Action_id === 7 &&
          body.object_attributes.state === 'opened' &&
          body.object_attributes.assignees.username === area.ActionParam[0]
        )
          this.reactionController(event, area, body);
        break;
      case 'merge_request':
        console.log('merge request action gitlab');
        if (area.Action_id === 3 && body.object_attributes.state === 'opened')
          this.reactionController(event, area, body);
        else if (
          area.Action_id === 4 &&
          body.object_attributes.state === 'closed'
        )
          this.reactionController(event, area, body);
        else if (
          area.Action_id === 2 &&
          body.object_attributes.state === 'updated'
        )
          this.reactionController(event, area, body);
        break;
      case 'tag_push':
        console.log('new tag action gitlab');
        if (area.Action_id === 1) this.reactionController(event, area, body);
    }
  }
  async ManagWebhookAction(event: string, body: any) {
    const repoName = body.project.name;

    const areas = await this.db.area.findMany({
      where: {
        ActionParam: {
          has: repoName,
        },
        Action_Service: 'Gitlab',
      },
    });
    for (const area of areas) {
      if (repoName === area.ActionParam[0])
        this.SearchAction(area, event, body);
    }
  }
}
