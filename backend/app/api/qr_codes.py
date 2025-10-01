from fastapi import APIRouter, HTTPException, status
from typing import List
from app.schemas.qr_code import QRCodeCreate, QRCodeResponse
from app.services.qr_service import QRService

router = APIRouter(prefix="/qr-codes", tags=["qr-codes"])


@router.post("/", response_model=QRCodeResponse, status_code=status.HTTP_201_CREATED)
async def create_qr_code(qr_data: QRCodeCreate):
    """Create a QR code for an event"""
    try:
        return await QRService.create_qr_code(qr_data)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create QR code: {str(e)}",
        )


@router.get("/{qr_id}")
async def get_qr_code(qr_id: str):
    """Get QR code details"""
    try:
        qr_code = await QRService.get_qr_code(qr_id)
        if not qr_code:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="QR code not found",
            )
        return qr_code
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch QR code: {str(e)}",
        )


@router.get("/event/{event_id}")
async def get_event_qr_codes(event_id: str):
    """Get all QR codes for an event"""
    try:
        return await QRService.get_event_qr_codes(event_id)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch QR codes: {str(e)}",
        )


@router.delete("/{qr_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_qr_code(qr_id: str):
    """Delete QR code"""
    try:
        await QRService.delete_qr_code(qr_id)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete QR code: {str(e)}",
        )
