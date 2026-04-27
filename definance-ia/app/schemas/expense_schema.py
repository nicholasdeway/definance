from pydantic import BaseModel
from typing import Optional

class ExpenseRequest(BaseModel):
    text: str

class ParsedExpense(BaseModel):
    name: str
    amount: float
    category: str
    type: str
    date: Optional[str] = None
    confidence: float