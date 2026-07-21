# Deployment Setup - astroai.ro

## Production Branch: `main`

Vercel e conectat la branchul `main` și deploy-ează automat orice schimbare pe GitHub.

## Auto-Sync Hook (Permanent Solution)

Un git post-commit hook asigură că orice commit pe orice branchă e automaticamente sync-at cu `main` și pushed.

**Cum funcționează:**
1. Faci commit pe orice branchă (inclusiv `unauthenticated-report-access`)
2. Hook-ul automat:
   - Merge-ează branchul curent pe `main`
   - Push-ează `main` pe GitHub
   - Revine la branchul original

**Rezultat:** Vercel detectează push-ul și deploy-ează imediat pe astroai.ro

## Workflow

```bash
# Lucru local pe orice branchă
git checkout feature-branch
# ... faci schimbări ...
git add .
git commit -m "feat: new feature"
# ↓ Hook-ul merge automat pe main și push
# → Vercel detectează și deploy-ează imediat
```

## Vercel Settings

- **Project:** AstroAI
- **Framework:** Next.js
- **Production Branch:** `main`
- **Build Command:** `npm run build`
- **Output Directory:** `.next`

## Testare Deploy

1. Fă schimbare oriunde
2. Commit: `git commit -m "..."`
3. Hook merge automat pe main
4. Vercel detect în 10-30 sec
5. Deploy live pe astroai.ro în 1-2 min

## Troubleshooting

Dacă pagina nu apare:
1. Verifica: `git log origin/main --oneline -3`
2. Verifica build: `npm run build`
3. Verifica hook: `ls -la .git/hooks/post-commit`

Hook e permanent - odata instalat, functioneaza mereu.
