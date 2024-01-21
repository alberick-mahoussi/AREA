import 'dart:async';
import 'package:flutter/material.dart';
import 'package:webview_flutter/webview_flutter.dart';
import 'package:oauth2/oauth2.dart' as oauth2;
import 'package:http/http.dart' as http;
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'dart:convert';
import 'package:google_sign_in/google_sign_in.dart';
import 'package:crypto/crypto.dart';
import 'dart:math';

var githubConfig = OAuthServiceConfig(
  serviceIdentifier: 'github',
  authorizationEndpoint: Uri.parse('${dotenv.env['GITHUB_AUTH_URL']}'),
  tokenEndpoint: Uri.parse('${dotenv.env['GITHUB_OAUTH_TOKEN']}'),
  clientID: '${dotenv.env['GITHUB_CLIENT_ID']}',
  clientSecret: '${dotenv.env['GITHUB_CLIENT_SECRET']}',
  redirectUri: '${dotenv.env['CALLBACK_URL']}/github',
  scopes: ['notifications', 'user', 'repo:status', 'public_repo', 'read:org', 'project', 'repo', 'admin:repo_hook', 'admin:org_hook'],
);


var gitlabConfig = OAuthServiceConfig(
  serviceIdentifier: 'gitlab',
  authorizationEndpoint: Uri.parse('${dotenv.env['GITLAB_AUTH_URL']}'),
  tokenEndpoint: Uri.parse('${dotenv.env['GITLAB_OAUTH_TOKEN']}'),
  clientID: '${dotenv.env['GITLAB_CLIENT_ID']}',
  clientSecret: '${dotenv.env['GITLAB_CLIENT_SECRET']}',
  redirectUri: '${dotenv.env['CALLBACK_URL']}/github',
  scopes: ['read_api', 'read_user', 'read_repository', 'write_repository', 'read_registry', 'write_registry', 'read_observability', 'write_observability', 'profile', 'email', 'api'],
);

var notionConfig = OAuthServiceConfig(
  serviceIdentifier: 'notion',
  authorizationEndpoint: Uri.parse('${dotenv.env['NOTION_AUTH_URL']}'),
  tokenEndpoint: Uri.parse('${dotenv.env['NOTION_OAUTH_TOKEN']}'),
  clientID: '${dotenv.env['NOTION_CLIENT_ID']}',
  clientSecret: '${dotenv.env['NOTION_CLIENT_SECRET']}',
  redirectUri: '${dotenv.env['CALLBACK_URL']}/notion',
  scopes: [],
);

var googleConfig = OAuthServiceConfig(
  serviceIdentifier: 'google',
  authorizationEndpoint: Uri.parse('${dotenv.env['GOOGLE_AUTH_URL']}'),
  tokenEndpoint: Uri.parse('${dotenv.env['GOOGLE_OAUTH_TOKEN']}'),
  clientID: '${dotenv.env['GOOGLE_CLIENT_ID']}',
  clientSecret: '${dotenv.env['GOOGLE_CLIENT_SECRET']}',
  redirectUri: '${dotenv.env['CALLBACK_URL']}/google',
  scopes: ['https://www.googleapis.com/auth/userinfo.profile', 'https://www.googleapis.com/auth/userinfo.email', 'https://www.googleapis.com/auth/gmail.modify', 'https://www.googleapis.com/auth/drive', 'https://www.googleapis.com/auth/calendar.events', 'https://mail.google.com/', 'https://www.googleapis.com/auth/youtube.force-ssl', 'https://www.googleapis.com/auth/gmail.readonly', 'https://www.googleapis.com/auth/gmail.send', 'https://www.googleapis.com/auth/calendar.events', 'https://www.googleapis.com/auth/calendar.events.owned'],
);

var microsoftConfig = OAuthServiceConfig(
  serviceIdentifier: 'microsoft',
  authorizationEndpoint: Uri.parse('${dotenv.env['MICROSOFT_AUTH_URL']}'),
  tokenEndpoint: Uri.parse('${dotenv.env['MICROSOFT_OAUTH_TOKEN']}'),
  clientID: '${dotenv.env['MICROSOFT_CLIENT_ID']}',
  clientSecret: '${dotenv.env['MICROSOFT_CLIENT_SECRET']}',
  redirectUri: '${dotenv.env['CALLBACK_URL']}/microsoft',
  scopes: ['user.read', 'calendars.readWrite', 'contacts.readWrite', 'mail.Read', 'mail.readWrite', 'mail.Send'],
);

var discordConfig = OAuthServiceConfig(
  serviceIdentifier: 'discord',
  authorizationEndpoint: Uri.parse('${dotenv.env['DISCORD_AUTH_URL']}'),
  tokenEndpoint: Uri.parse('${dotenv.env['DISCORD_OAUTH_TOKEN']}'),
  clientID: '${dotenv.env['DISCORD_CLIENT_ID']}',
  clientSecret: '${dotenv.env['DISCORD_CLIENT_SECRET']}',
  redirectUri: '${dotenv.env['CALLBACK_URL']}/discord',
  scopes: ['identify', 'bot'],
);

var spotifyConfig = OAuthServiceConfig(
  serviceIdentifier: 'spotify',
  authorizationEndpoint: Uri.parse('${dotenv.env['SPOTIFY_AUTH_URL']}'),
  tokenEndpoint: Uri.parse('${dotenv.env['SPOTIFY_OAUTH_TOKEN']}'),
  clientID: '${dotenv.env['SPOTIFY_CLIENT_ID']}',
  clientSecret: '${dotenv.env['SPOTIFY_CLIENT_SECRET']}',
  redirectUri: '${dotenv.env['CALLBACK_URL']}/spotify',
  scopes: ['user-read-private', 'user-read-email', 'playlist-modify-private' ,'playlist-modify-public'],
);

class OAuthWebView extends StatefulWidget {
  final Uri authorizationUrl;
  final Uri redirectUri;
  final Function(String) onCodeReceived;

  OAuthWebView({
    Key? key,
    required this.authorizationUrl,
    required this.redirectUri, // Ajout du redirectUri
    required this.onCodeReceived,
  }) : super(key: key);

  @override
  _OAuthWebViewState createState() => _OAuthWebViewState();
}
class OAuthServiceConfig {
  final String serviceIdentifier;
  final Uri authorizationEndpoint;
  final Uri tokenEndpoint;
  final String clientID;
  final String clientSecret;
  final String redirectUri;
  final List<String> scopes;

  OAuthServiceConfig({
    required this.serviceIdentifier,
    required this.authorizationEndpoint,
    required this.tokenEndpoint,
    required this.clientID,
    this.clientSecret = '',
    required this.redirectUri,
    required this.scopes,
  });
}

class _OAuthWebViewState extends State<OAuthWebView> {
  final Completer<WebViewController> _controller = Completer<WebViewController>();

  @override
  Widget build(BuildContext context) {
    print(widget.redirectUri.toString());
    return WebView(
      initialUrl: widget.authorizationUrl.toString(),
      javascriptMode: JavascriptMode.unrestricted,
      onWebViewCreated: (WebViewController webViewController) {
        webViewController.clearCache();
        _controller.complete(webViewController);
      },
      navigationDelegate: (NavigationRequest request) {
        if (request.url.startsWith(widget.redirectUri.toString())) {
          var uri = Uri.parse(request.url);
          var code = uri.queryParameters['code'];
          if (code != null) {
            widget.onCodeReceived(code);
            Navigator.pop(context);
          }
          return NavigationDecision.prevent;
        }
        return NavigationDecision.navigate;
      },
    );
  }
}

GoogleSignIn _googleSignIn = GoogleSignIn(
  scopes: ['https://www.googleapis.com/auth/userinfo.profile', 'https://www.googleapis.com/auth/userinfo.email', 'https://www.googleapis.com/auth/gmail.modify', 'https://www.googleapis.com/auth/drive', 'https://www.googleapis.com/auth/calendar.events', 'https://mail.google.com/', 'https://www.googleapis.com/auth/youtube.force-ssl', 'https://www.googleapis.com/auth/gmail.readonly', 'https://www.googleapis.com/auth/gmail.send', 'https://www.googleapis.com/auth/calendar.events', 'https://www.googleapis.com/auth/calendar.events.owned'],
);

Future<String?> signInWithGoogle() async {
  try {
    await _googleSignIn.signOut();
    final GoogleSignInAccount? googleUser = await _googleSignIn.signIn();
    if (googleUser != null) {
      final GoogleSignInAuthentication googleAuth = await googleUser.authentication;
      return googleAuth.accessToken;
    }
  } catch (error) {
    print(error);
    return null;
  }
  return null;
}

Future<String> getOAuthToken(BuildContext context, OAuthServiceConfig config) async {
  if (config.serviceIdentifier == "google") {
    final String? accessToken = await signInWithGoogle();
    if (accessToken == null) {
      throw Exception("La connexion Google a échoué ou a été annulée par l'utilisateur.");
    }
    return accessToken;
  }
  final grant = oauth2.AuthorizationCodeGrant(
    config.clientID,
    config.authorizationEndpoint,
    config.tokenEndpoint,
    secret: config.clientSecret,
  );
  var authUrl = grant.getAuthorizationUrl(
    Uri.parse(config.redirectUri),
    scopes: config.scopes,
  );
  if (config.serviceIdentifier == "discord" || config.serviceIdentifier == "spotify") {
    authUrl = Uri.https(config.authorizationEndpoint.authority, config.authorizationEndpoint.path, {
      'client_id': config.clientID,
      'redirect_uri': config.redirectUri,
      'response_type': 'code',
      'grant_type': 'authorization_code',
      'scope': config.scopes.join(' '),
    });
  }

  String? code;

  final CookieManager cookieManager = CookieManager();
  await cookieManager.clearCookies();

  await Navigator.push(
    context,
    MaterialPageRoute(
      builder: (context) => OAuthWebView(
        authorizationUrl: authUrl,
        redirectUri: Uri.parse(config.redirectUri),
        onCodeReceived: (receivedCode) {
          code = receivedCode;
        },
      ),
    ),
  );

  if (code == null) throw Exception("Authentification annulée ou échouée");

  if(config.serviceIdentifier == "microsoft") {
    try {
      final httpClient = await grant.handleAuthorizationResponse({'code': code!});
      return httpClient.credentials.accessToken;
    } catch (e) {
      print('Erreur lors de la demande du token: $e');
      return "";
    }
  }

  if (config.serviceIdentifier == "discord" || config.serviceIdentifier == "spotify") {
    var httpClient = http.Client();
    var response = await httpClient.post(
      config.tokenEndpoint,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: {
        'client_id': config.clientID,
        'client_secret': config.clientSecret,
        'code': code,
        'grant_type': 'authorization_code',
        'redirect_uri': config.redirectUri.toString(),
      },
    );
    print(response.statusCode);
    if (response.headers['content-type']!.startsWith('application/json')) {
      var jsonResponse = jsonDecode(response.body);
      print(jsonResponse);
      var credentials = oauth2.Credentials(
        jsonResponse['access_token'],
        refreshToken: jsonResponse['refresh_token'],
        idToken: jsonResponse['id_token'],
        tokenEndpoint: config.tokenEndpoint,
        scopes: jsonResponse['scope']?.split(' '),
        expiration: jsonResponse['expires_in'] != null
            ? DateTime.now().add(Duration(seconds: jsonResponse['expires_in']))
            : null,
      );
      return credentials.accessToken;
    } else {
      throw Exception("Expected a JSON response, got '${response.body}'.");
    }
  }

  if (config.serviceIdentifier == "github") {
    var httpClient = http.Client();
    print(code!);
    var response = await httpClient.post(
      config.tokenEndpoint,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: {
        'client_id': config.clientID,
        'client_secret': config.clientSecret,
        'code': code,
        'redirect_uri': config.redirectUri.toString(),
      },
    );
    if (response.headers['content-type']!.startsWith('application/json')) {
      var jsonResponse = jsonDecode(response.body);
      var credentials = oauth2.Credentials(
        jsonResponse['access_token'],
        refreshToken: jsonResponse['refresh_token'],
        idToken: jsonResponse['id_token'],
        tokenEndpoint: config.tokenEndpoint,
        scopes: jsonResponse['scope']?.split(' '),
        expiration: jsonResponse['expires_in'] != null
            ? DateTime.now().add(Duration(seconds: jsonResponse['expires_in']))
            : null,
      );
      return credentials.accessToken;
    } else {
      throw Exception("Expected a JSON response, got '${response.body}'.");
    }
  }
  if (config.serviceIdentifier == "notion") {
    var credentials = '${config.clientID}:${config.clientSecret}';
    var encodedCredentials = base64Encode(utf8.encode(credentials));

    var httpClient = http.Client();
    var response = await httpClient.post(
      config.tokenEndpoint,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': 'Basic $encodedCredentials',
      },
      body: jsonEncode({
        'grant_type': 'authorization_code',
        'code': code,
        'redirect_uri': config.redirectUri,
      }),
    );
    if (response.headers['content-type']!.startsWith('application/json')) {
      var jsonResponse = jsonDecode(response.body);
      return jsonResponse['access_token'];
    } else {
      throw Exception("Expected a JSON response, got '${response.body}'.");
    }
  }
  return "";
}
