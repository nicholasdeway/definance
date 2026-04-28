from pydantic import BaseModel
from typing import Optional, List
 
class ExpenseRequest(BaseModel):
    text: str
    categories: List[str] = []

class ParsedExpense(BaseModel):
    name: str
    amount: float
    category: str
    type: str
    date: Optional[str] = None
    confidence: float