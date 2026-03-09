# Project Context

This project is designed to be the famous glaasdoor, but for univeristies of the brazilian market

Write code that a Jr Software Engineer can understeand, following clean code principles

## Standards

- Write tests when creating new features
- Use only javascript (node)
- Prefer variables with verbose names rather one letter variables
- Maintain the same UI/UX across all pages of the project
- Document new routes on swagger docs

## Git Workflow

- main branch only accept hotfix PRs, only in case of urgent bugs in production enviroment
- Changes should only be merged in development branch with a PR

1. Commit and push from the worktree:
   cd /path/to/worktree
   git add <files>
   git commit -m "your message"
   git pull origin development # Check for changes in dev branch
   git push -u origin <branch-name>
2. Create a PR targeting your desired base branch (e.g.,
   development):
   gh pr create --base development --title "Your title" --body
   "Description"
3. After the PR is merged, clean up the worktree:

# From the main repo

git worktree remove /path/to/worktree
git branch -d <branch-name>
