from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pdf2docx import Converter
import tempfile
import os

app = FastAPI(title="PDF to DOCX Converter API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict this to your Vite dev server port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/convert")
async def convert_pdf(file: UploadFile = File(...)):
    if not file.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="File must be a PDF")

    # Create temporary files for the input PDF and output DOCX
    with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp_pdf:
        content = await file.read()
        tmp_pdf.write(content)
        tmp_pdf_path = tmp_pdf.name
    
    tmp_docx_path = tmp_pdf_path.replace(".pdf", ".docx")

    try:
        # Run conversion
        cv = Converter(tmp_pdf_path)
        cv.convert(tmp_docx_path, start=0, end=None)
        cv.close()

        # Return the generated DOCX file
        return FileResponse(
            tmp_docx_path,
            media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            filename=file.filename.replace(".pdf", ".docx")
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        # Fast API FileResponse needs the file to exist to send it,
        # so we cannot aggressively delete tmp_docx_path here in this simple setup.
        # But we can clean up the input pdf
        if os.path.exists(tmp_pdf_path):
            try:
                os.remove(tmp_pdf_path)
            except:
                pass
