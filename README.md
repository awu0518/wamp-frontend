# wamp-frontend

[ProgressAndGoals.md](https://drive.google.com/file/d/18HTB-yX5NDy__R0-bOOHL8cX_KZsnquZ/view?usp=drive_link)

## Deployment

The backend API is deployed on PythonAnywhere:

`https://wamp-limjiannn.pythonanywhere.com`

The frontend CI/CD is handled by GitHub Actions in the repository root:

- `.github/workflows/wamp-front-ci.yml`: runs install, lint, test, and build for `project/wamp-front`
- `.github/workflows/wamp-front-deploy-pages.yml`: deploys `project/wamp-front/dist` to GitHub Pages on pushes to `main`/`master`


## Developer Logs Endpoint

The project includes a developer logs endpoint:

`GET /developer/logs`

Supported query parameters:

- `type=error`
- `type=server`
- `type=access`

No authentication is required for this endpoint.