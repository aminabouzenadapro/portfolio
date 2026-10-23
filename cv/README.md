# CV

`cv.html` is the source of `../Amina-Bouzenada-CV.pdf`. After editing it, run this in PowerShell from this folder to regenerate the PDF with Microsoft Edge:

```powershell
& "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" --headless=new --no-pdf-header-footer --print-to-pdf="$PWD\..\Amina-Bouzenada-CV.pdf" "file:///$PWD/cv.html"
```
