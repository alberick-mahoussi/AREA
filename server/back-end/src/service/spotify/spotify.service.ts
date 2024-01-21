import { Injectable, Body } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { Area, Service } from '@prisma/client';
import { TokenDto } from 'src/auth/dto';
import { ConnectDbService } from 'src/connect-db/connect-db.service';
import * as querystring from 'querystring';

@Injectable()
export class SpotifyService {
  constructor(
    private config: ConfigService,
    private db: ConnectDbService) {}

    async exchangeCodeForToken(AutherizationCode: string): Promise<TokenDto> {
      const code = AutherizationCode
      if (code) {
        try {
          const data = querystring.stringify({
            code: code,
            redirect_uri: `http://localhost:8081/spotify`,
            grant_type: 'authorization_code',
          })
          const client_id = this.config.get('SPOTIFY_CLIENT_ID')
          const client_secret = this.config.get('SPOTIFY_CLIENT_SECRET')
          const tokenResponse = await axios.post(
            'https://accounts.spotify.com/api/token',
            data,
            {
              headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': 'Basic ' + Buffer.from(client_id + ':' + client_secret).toString('base64')
              },
            },
          );
          const accessToken = tokenResponse.data.access_token
          //const refreshToken = queryParams.get('refresh_token');
          const refreshToken = accessToken

          if (!accessToken || !refreshToken) {
            throw new Error("Access token or refreshtoken not found in the response");
          }
          const tokenDto = new TokenDto();
          tokenDto.Token = accessToken;
          tokenDto.RefreshToken = refreshToken;
          return tokenDto;
        } catch (error) {
          console.error(error);
        }
      }
    }

  async getUserInfo(accessToken: string): Promise<any> {
    try {
      const userInfoResponse = await axios.get(
        'https://api.spotify.com/v1/me',
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

  async PlaylistSizeAbove(token: string, area: Area) {
    try {
      const playlisturl = area.ActionParam[0];
      const playlistId = playlisturl.split(':')[2];
      const apiUrl = `https://api.spotify.com/v1/playlists/${playlistId}`;
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      };
      const response = await axios.get(apiUrl, {headers})
      return response;
    } catch (error) {
      console.error(
        "Erreur lors du get des playlists:",
        error,
      );
      throw new Error(
        "Erreur lors du get des playlists:",
      );
    }
  }

  async CreatePlaylist(token: string, area: Area, messageContent: string) {
    try {
      console.log(token)
      const user = await this.getUserInfo(token);
      const apiUrl = `https://api.spotify.com/v1/users/${user.id}/playlists`;
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      };
      const data = {
        name: area.ReactionParam[0],
        description: messageContent,
        public: false
      };
      await axios.post(apiUrl, data, {headers})
    } catch (error) {
      console.error(
        "Erreur lors de la création de la playlist:",
        error,
      );
      throw new Error(
        "Erreur lors de la création de la playlist",
      );
    }
  }

  async AddSongToPlaylist(token: string, area: Area) {
    try {
      const playlisturl = area.ReactionParam[0];
      const playlistId = playlisturl.split(':')[2];
      const uris = area.ReactionParam[1];
      const apiUrl = `https://api.spotify.com/v1/playlists/${playlistId}/tracks`;
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      };
      const data = {
        uris: [uris],
        position: 0
      };
      await axios.post(apiUrl, data, { headers })
    } catch (error) {
      console.error(
        "Erreur lors de l'ajout de la musique à la playlist:",
        error,
      );
      throw new Error(
        "Erreur lors de l'ajout de la musique à la playlist:",
      );
    }
  }

  async ActionSpotify(area: Area) {
    const service = await this.db.service.findFirstOrThrow({
      where: {
        NameService: area.Action_Service,
        UserId: area.UserId
      }
    })
    const token = await this.db.token.findUnique({
      where: {
        id: service.TokenId
      }
    })
    switch (area.Action_id) {
      case 0:
        const response = await this.PlaylistSizeAbove(token.Token, area);
        if (response.data.tracks.total > area.ActionParam[1]) {
          return "There are more than " + area.ActionParam[1] + " tracks in the playlist! There are actually " + response.data.tracks.total + " tracks!";
        } else {
          return;
        }
    }
  }

  async ReactionSpotify(messageContent: string, area: Area) {
    const service = await this.db.service.findFirstOrThrow({
      where: {
        NameService: area.Reaction_Service,
        UserId: area.UserId
      }
    })
    const token = await this.db.token.findUnique({
      where: {
        id: service.TokenId
      }
    })
    switch (area.ReactionId) {
      case 0:
        await this.CreatePlaylist(token.Token, area, messageContent);
        break;
      case 1:
        await this.AddSongToPlaylist(token.Token, area);
        break;
    }
  }
}