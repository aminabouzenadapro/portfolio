# Portfolio

A static portfolio site written in plain HTML, CSS and JS. It has no build step and no dependencies.

## Files
| File | What it is |
|---|---|
| `projects.js` | **All of your content**: profile, projects, skills, experience. This is the only file you need to edit. |
| `index.html` | Page layout. |
| `styles.css` | Design. The colors are at the top (`--accent`, `--accent-2`). |
| `script.js` | Renders the content. You normally don't touch it. |

## Preview
```
python -m http.server 8000
```
then open http://localhost:8000. Double-clicking `index.html` also works.

## Add a project
1. Open `projects.js`.
2. Copy an existing `{ ... },` block inside `PROJECTS` and paste it below.
3. Edit the fields:
   ```js
   {
     title: "My New App",
     category: "Web App",           // a new category creates a new filter tab
     summary: "One or two lines shown on the card.",
     description: ["First paragraph shown in the popup.", "Second paragraph."],
     role: "Full-stack developer",
     year: "2026",
     tags: ["React", "Node.js"],
     image: "images/my-new-app.png", // screenshot shown in a browser frame ("" = auto mockup)
     url: "my-new-app.com",          // text in the browser frame's address bar
     color: "#6366f1",               // accent color for the card
     github: "https://github.com/you/my-new-app",
     demo: "https://my-new-app.com",
     featured: false,                // true = large card at the top
   },
   ```
4. Save the file and refresh the page.

Featured projects appear as large cards. All other projects go in the "More projects" grid, which has filter tabs.

Clicking any project opens a popup with the full description, role, tech stack and links.

Put screenshots in an `images/` folder. A 16:10 ratio works best, for example 1440×900.

## Personalize
- In `PROFILE`, set your name, job title, headline (wrap words in `*stars*` for the gradient), tagline, status badge, photo (`avatar`), email, about paragraphs, key facts and social links.
- Add a `resume.pdf` next to `index.html` so the **Download CV** button works.

## Deploy for free
- **GitHub Pages:** push these files to a repo, then go to Settings → Pages → deploy from the `main` branch.
- **Netlify / Vercel / Cloudflare Pages:** drag the folder in, or connect the repo.
