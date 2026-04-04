from worker.celery_app import celery_app
import time

@celery_app.task(name="app.tasks.ocr.process_receipt_ocr")
def process_receipt_ocr(expense_id: str, receipt_url: str):
    """
    Simulates sending the receipt to AWS Textract or Google Cloud Vision.
    """
    # Mocking OCR processing delay
    time.sleep(3)
    
    # In a real application, we would instantiate a synchronous DB session 
    # here and update the expense.ocr_metadata with the extracted text.
    return {
        "expense_id": expense_id,
        "status": "success",
        "extracted_amount": 100.00,
        "extracted_merchant": "Coffee Shop"
    }
