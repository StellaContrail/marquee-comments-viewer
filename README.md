# Marquee Comments Viewer
Display marqueeing comments on your desktop

## Features
- Real-time comments rendering
- Fully IaC support
- Runs smoothly with GPU support

## Installation
You need to install `aws-cdk` and `npm` to execute following commands.
If you haven't configured aws profiles, you also need to install `aws-cli` and set up your aws credential profiles.
```bash
cd ./marquee-comments-viewer/web
npm install
npm run build
cd ./marquee-comments-viewer/infra
cdk deploy
```


## Architecture
![architecture](architecture.png)

## Roadmap
1. [client] GUI Form for start/stop listening button
2. [web] chat-like queue history
3. [all] test codes
4. [web] cognito login form
5. [all] refactorization

## Final Architecture
![final architecture](architecture_final.png)

## License
MIT License

