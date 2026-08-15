@echo off
color 0B
echo =======================================
echo   PDF to Word Local AI Server
echo =======================================
echo.
echo Installing the required Python layout engines (if not installed)...
cd pdf-backend
pip install -r requirements.txt
echo.
echo.
echo Starting the High-Performance DOCX Server...
echo PLEASE LEAVE THIS WINDOW OPEN while using the PDF to Word converter in your browser!
echo =======================================
echo.
uvicorn main:app --host 127.0.0.1 --port 8000 --reload
pause
