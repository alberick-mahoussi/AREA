import { Injectable, Inject, forwardRef, Body } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { Octokit } from '@octokit/rest';
import { GithubCloseIssue, GithubCreatePullRequest, GithubDeletebranch, GithubNewbranch } from 'src/model/Github';
import { GithubCreateIssue } from '../../model/Github';
import { Area, Service } from '@prisma/client';
import { TokenDto } from 'src/auth/dto';
import { ConnectDbService } from 'src/connect-db/connect-db.service';
import { MailService } from '../mail/mail.service';
import { NotionService } from '../notion/notion.service';
import { DiscordService } from '../discord/discord.service';
import { GitlabService } from '../gitlab/gitlab.service';
import { MicrosoftService } from '../microsoft/microsoft.service';
import { SpotifyService } from '../spotify/spotify.service';
import { GoogleService } from '../google/google.service';

@Injectable()
export class GithubService {
  constructor(
    @Inject(forwardRef(() => GitlabService))
    private gitlabService: GitlabService,
    private config: ConfigService,
    private db: ConnectDbService,
    private mail: MailService,
    // @Inject(forwardRef(() => NotionService))
    private notion: NotionService,
    // @Inject(forwardRef(() => DiscordService))
    private discord: DiscordService,
    @Inject(forwardRef(() => MicrosoftService))
    private outlook: MicrosoftService,
    private spotify: SpotifyService,
    private google: GoogleService
  ) {}

  async exchangeCodeForToken(AutherizationCode: string): Promise<TokenDto> {
    try {

      const data = {
        client_id: this.config.get('GITHUB_CLIENT_ID'),
        client_secret: this.config.get('GITHUB_SECRET_ID'),
        code: AutherizationCode,
        redirect_uri: 'http://localhost:8080/github/callback'
      }

      const tokenResponse = await axios.post(
        'https://github.com/login/oauth/access_token',
        new URLSearchParams(data),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      );
      const queryParams = new URLSearchParams(tokenResponse.data);
      const accessToken = queryParams.get('access_token');
      //const refreshToken = queryParams.get('refresh_token');
      const refreshToken = accessToken

      if (!accessToken || !refreshToken) {
        throw new Error("Access token or refreshtoken not found in the response");
      }
      const tokenDto = new TokenDto();
      tokenDto.Token = accessToken;
      tokenDto.RefreshToken = refreshToken;
      return tokenDto;
    } catch (error: any) {
      console.error(
        "Erreur lors de l'échange du code contre le token :",
        error.message, error.response?.data?.error_description
      );
      throw new Error("Erreur lors de l'échange du code contre le token");
    }
  }

  async getUserInfo(accessToken: string): Promise<any> {
    try {
      const userInfoResponse = await axios.get(
        'https://api.github.com/user',
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
      throw new Error(
        "Erreur lors de la récupération des informations de l'utilisateur",
      );
    }
  }

  static async getOwner(accessToken: string) {
    try {
      const userInfoResponse = await axios.get(
        'https://api.github.com/user',
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );
      const username: string = userInfoResponse.data.login
      //console.log(username);
      return username;
    } catch (error) {
      console.error(
        "Erreur lors de la récupération des informations de l'utilisateur :",
        error,
      );
      throw new Error(
        "Erreur lors de la récupération des informations de l'utilisateur",
      );
    }
  }

  async GithubAddWebhook(owner: string, repo: string, accessToken: string) {
    const ownerUrl = this.config.get('EXTERNAL_URL')
    const url = `https://api.github.com/repos/${owner}/${repo}/hooks`;
    const webhookConfig = {
      name: 'web',
      config: {
        url: `${ownerUrl}/github/webhook`,
        content_type: 'json',
        //secret: 'AREA',
      },
      events: ['push', 'pull_request', 'issues', 'create', 'delete', 'ping'],
      active: true,
    };

    try {
      const response = await axios.post(url, webhookConfig, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });
    } catch (error) {
      console.error(error.response.data);
    }
  }

  static async GithubRemoveWebhook(owner: string, repo: string, webhookId: number, accessToken: string) {
    const url = `https://api.github.com/repos/${owner}/${repo}/hooks/${webhookId}`;

    try {
      // Appel à l'API GitHub pour supprimer le webhook
      const response = await axios.delete(url, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      return response;
    } catch (error) {
      console.error(error.response.data);
    }
  }

  private lauchOctokit(AccessToken: string) {
    return new Octokit({
      auth: AccessToken,
      oauth: {
        client_id: this.config.get('GITHUB_CLIENT_ID'),
        client_secret: this.config.get('GITHUB_SECRET_ID')
      }
    })
  }

  async GithubNewbranch(accessToken: string, body: GithubNewbranch) {
    const octokit = this.lauchOctokit(accessToken);
    try {
      const baseBranchResponse = await octokit.git.getRef({
        owner: body.owner,
        repo: body.repository,
        ref: `heads/${body.baseBranch}`,
      });

      const baseCommitSha = baseBranchResponse.data.object.sha;

      await octokit.git.createRef({
        owner: body.owner,
        repo: body.repository,
        ref: `refs/heads/${body.NewBranchName}`,
        sha: baseCommitSha,
      });

    } catch (error) {
      console.error('Erreur lors de la création de la branche :', error.message);
    }
  }

  async deleteBranch(accessToken: string, body: GithubDeletebranch): Promise<void> {
    const octokit = this.lauchOctokit(accessToken);
    try {
      await octokit.git.deleteRef({
        owner: body.owner,
        repo: body.repository,
        ref: `heads/${body.Branchname}`,
      });

    } catch (error) {
      console.error(`Erreur lors de la suppression de la branche '${body.Branchname}'.`, error.message);
    }
  }

  async GithubNewIssue(accessToken: string, Body: GithubCreateIssue) {
    const octokit = this.lauchOctokit(accessToken);

    try {
      await octokit.rest.issues.create({
        repo: Body.repository,
        owner: Body.owner,
        title: Body.title,
        body: Body.body,
        assignees: [Body.assignees]
      });
    } catch (error: unknown) {
      const some_error = error as Error;
      console.error(some_error);
    }
  }

  async GithubCloseIssueByTitle(accessToken: string, Body: GithubCloseIssue) {
    const octokit = this.lauchOctokit(accessToken);

    try {
      const issues = await octokit.rest.issues.listForRepo({
        owner: Body.owner,
        repo: Body.repository,
        state: 'open',
      });

      const matchingIssue = issues.data.find(issue => issue.title === Body.title);

      if (matchingIssue) {
        await octokit.rest.issues.update({
          repo: Body.repository,
          owner: Body.owner,
          issue_number: matchingIssue.number, // Utilisez le numéro de l'issue ici
          state: 'closed',
        });
      } else {
        console.log('Aucune issue trouvée avec le titre spécifié.');
      }
    } catch (error: unknown) {
      const some_error = error as Error;
      console.error(some_error);
    }
  }

  async GithubNewPullRequest(accessToken: string, Body: GithubCreatePullRequest) {
    const octokit = this.lauchOctokit(accessToken);

    try {
      await octokit.rest.pulls.create({
        repo: Body.repository,
        owner: Body.Owner,
        title: Body.title,
        body: Body.body,
        head: Body.baseBranch,
        base: Body.baseBranch,
      });
    } catch (error: unknown) {
      const some_error = error as Error;
      console.error(some_error);
    }
  }

  async InformationOnWebhookAction(action: string, body: any): Promise<string> {
    const repoName = body.repository.name;
    const repoOwner = body.repository.owner.login;
    const username = body.sender.login;
    const createdAt = new Date(body.head_commit.timestamp);
    let actionMessage = '';

    switch (action) {
      case 'push':
        actionMessage = 'pushed code to';
        break;
      case 'pull_request':
        actionMessage = 'created a pull request on';
        break;
      case 'issues':
        if (body.action === 'opened')
          actionMessage = 'created an issue on';
        else if (body.action === 'closed')
          actionMessage = 'closed an issue on';
        break;
      case 'create':
        actionMessage = 'created a branch on';
        break;
      case 'delete':
        actionMessage = 'deleted a branch on';
        break;
      default:
        actionMessage = 'performed an unknown action on';
    }

    const formattedDate = `${createdAt.toLocaleDateString()} at ${createdAt.toLocaleTimeString()}`;

    return `${username} ${actionMessage} the repository ${repoName} owned by ${repoOwner} on ${formattedDate}.`;
  }

  public async ReactionGitHub(area: Area) {

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

    const name = await GithubService.getOwner(token.Token)
    switch (area.ReactionId) {
      case 0:
        this.GithubNewPullRequest(token.Token, {
          Owner: name, repository: area.ReactionParam[0],
          title: area.ReactionParam[1], body: area.ReactionParam[2],
          baseBranch: area.ReactionParam[3], headBranch: area.ReactionParam[4]
        })
        break;
      case 1:
        this.GithubNewIssue(token.Token, {
          owner: name, repository: area.ReactionParam[0],
          title: area.ReactionParam[1], body: area.ReactionParam[2], assignees: area.ReactionParam[3]
        })
        break;
      case 2:
        this.GithubCloseIssueByTitle(token.Token, {
          owner: name, repository: area.ReactionParam[0], title: area.ReactionParam[1]
        })
        break;
      case 3:
        this.GithubNewbranch(token.Token, {
          owner: name, repository: area.ReactionParam[0],
          baseBranch: area.ReactionParam[1], NewBranchName: area.ReactionParam[2]
        })
        break;
      case 4:
        this.deleteBranch(token.Token, {
          owner: name, repository: area.ReactionParam[0], Branchname: area.ReactionParam[1]
        })
        break;
      case 5:
        this
    }
  }

  async reactionController(action: string, area: Area, Body: any) {
    const reaction: string = area.Reaction_Service

    switch (reaction) {
      case 'Mail':
        this.mail.sendEmail(await this.InformationOnWebhookAction(action, Body), area)
        break;
      case 'Discord':
        this.discord.ReactionDiscord(await this.InformationOnWebhookAction(action, Body), area);
        break;
      case 'Notion':
        this.notion.ReactionNotion(await this.InformationOnWebhookAction(action, Body), area)
        break;
      case 'Github':
        this.ReactionGitHub(area);
        break;
      case 'Gitlab':
        this.gitlabService.ReactionGitlab(area);
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
        console.log('push action');
        if (area.Action_id === 0)
          this.reactionController(event, area, body)
        break;
      case 'pull_request':
        console.log('pull request')
        if (area.Action_id === 3)
          this.reactionController(event, area, body)
        break;
      case 'issues':
        console.log('Issue')
        if (area.Action_id === 1 && body.action === 'opened')
          this.reactionController(event, area, body)
        else if (area.Action_id === 2 && body.action === 'closed')
          this.reactionController(event, area, body)
        break;
      case 'create':
        console.log('create')
        if (area.Action_id === 6)
          this.reactionController(event, area, body)
        break;
      case 'delete':
        console.log('delete')
        if (area.Action_id === 5)
          this.reactionController(event, area, body)
        break;
    }
  }

  async ManagWebhookAction(event: string, body: any) {
    const repoName = body.repository?.name;

    const areas = await this.db.area.findMany({
      where: {
        ActionParam: {
          has: repoName
        },
        Action_Service: 'Github'
      }
    })
    for (const area of areas) {
      if (body.repository.name === area.ActionParam[0] && area.ReactionId != 4)
        this.SearchAction(area, event, body)
      else if (body.repository.name === area.ActionParam[1] && body.sender.name === area.ActionParam[0] && area.ReactionId === 4)
        this.SearchAction(area, event, body)
    }
  }
}