# Real-World Examples & Walkthrough

## How to Handle Common Situations in Your Shop

---

## Table of Contents

1. [Scenario 1: Simple Daily Sale](#scenario-1-simple-daily-sale)
2. [Scenario 2: Bulk Contractor Sale](#scenario-2-bulk-contractor-sale)
3. [Scenario 3: Customer with Credit](#scenario-3-customer-with-credit)
4. [Scenario 4: New Product Arrives](#scenario-4-new-product-arrives)
5. [Scenario 5: Customer Asks for a Discount](#scenario-5-customer-asks-for-a-discount)
6. [Scenario 6: Stock is Running Low](#scenario-6-stock-is-running-low)
7. [Scenario 7: A Customer Returns Something](#scenario-7-a-customer-returns-something)
8. [Scenario 8: Month-End Financial Check](#scenario-8-month-end-financial-check)

---

## Scenario 1: Simple Daily Sale

### Situation

It's 10:30 AM. A local homeowner comes to your shop to buy materials for a small home repair.

**"Hi, I need 5kg of cement, 2 bags of sand, and a can of paint thinner."**

### What You Do (Step by Step)

#### Step 1: Open the POS System

- On your computer, click the **"POS"** button from the main menu
- The sales page opens
- You see empty shopping cart area

#### Step 2: Add Customer

- Click **"Select Customer"** button
- You don't know this customer
- Click **"Quick Add"** or **"Add New Customer"**
- Type their name: "John Silva"
- Type their phone: "0775-123456"
- Click Save

#### Step 3: Add Cement to Cart

- Click the search box
- Type: "cement" (or "cement 5kg" if you're specific)
- System shows results: different cement options
- Click on: "5kg Portland Cement - Rs. 250"
- Enter quantity: "1"
- Click "Add to Cart"
- **System shows:**
  - Cement 5kg: 1 × Rs. 250 = Rs. 250
  - Current stock: 95 bags available ✓

#### Step 4: Add Sand

- Search: "sand"
- Click: "25kg Sand Bag - Rs. 400"
- Quantity: "2"
- Click "Add to Cart"
- **System shows:**
  - Sand 25kg: 2 × Rs. 400 = Rs. 800
  - Current stock: 38 bags available ✓

#### Step 5: Add Paint Thinner

- Search: "paint thinner"
- Click: "1L Paint Thinner - Rs. 350"
- Quantity: "1"
- Click "Add to Cart"
- **System shows:**
  - Paint Thinner 1L: 1 × Rs. 350 = Rs. 350
  - Current stock: 12 cans available ✓

#### Step 6: Review Cart

```
CART SUMMARY:
━━━━━━━━━━━━━━━━━━━━━━━━
Cement 5kg × 1          = Rs. 250
Sand 25kg × 2           = Rs. 800
Paint Thinner 1L × 1    = Rs. 350
━━━━━━━━━━━━━━━━━━━━━━━━
Subtotal                = Rs. 1,400
VAT (15% on thinner)    = Rs. 52.50 ← (If applicable)
━━━━━━━━━━━━━━━━━━━━━━━━
TOTAL                   = Rs. 1,452.50
```

#### Step 7: Choose Payment Method

- Customer says: "I'll pay cash"
- Click: **"Cash"** payment button
- Click: **"Proceed to Payment"**

#### Step 8: Process Payment

- You tell customer: "That's Rs. 1,452.50"
- Customer counts out money
- You receive: Rs. 1,500 (cash)
- System calculates change: Rs. 47.50

#### Step 9: Confirm & Complete

- Click: **"Complete Sale"**
- System shows: "Sale #2847 - SAVED ✓"
- Receipt prints automatically

#### Step 10: Give Receipt to Customer

- Take receipt from printer
- Hand it to customer with their change
- Say: "Thank you, have a good day!"

### What Happened Automatically (Behind The Scenes)

✓ Stock updated: Cement went from 95 to 94, Sand from 38 to 36, Paint Thinner from 12 to 11  
✓ Customer recorded: John Silva, phone 0775-123456  
✓ Sale saved: Sale #2847, Rs. 1,452.50, Date/Time recorded  
✓ VAT calculation: If items were taxable, 15% was correctly added  
✓ Daily total: Updated - this sale is now part of "Today's sales: Rs. X,XXX"  
✓ Receipt: Professional receipt printed with shop name, address, VAT reg, etc.

### Timeline

- **Total time:** 3-4 minutes
- If you use barcode scanner: 2-3 minutes

---

## Scenario 2: Bulk Contractor Sale

### Situation

It's 2:00 PM. A contractor you know comes to buy materials for a renovation project.

**"Hi! I need 100 bags of cement, 40 bags of sand, 50kg of nails assorted, 20 rolls of electrical wire."**

**"Also, can you give me a good price? I might buy again next week."**

### What You Do

#### Step 1: Find the Contractor

- In POS, click **"Select Customer"**
- Search: "contractor" or their name if you remember: "Ravi's Contractors"
- Click to select them
- **System shows:**
  - Last purchase: 2 weeks ago for Rs. 18,500
  - Outstanding balance: Rs. 0 (paid up) ✓
  - Total spent with you: Rs. 127,000 (good customer!)

#### Step 2: Start Ringing Items

Start adding to cart - use barcode scanner if available (much faster!)

**Cement - 100 bags**

- Search/Scan: "Cement 5kg"
- Noticed the Contractor says "100 bags"
- Enter quantity: 100
- Add to cart
- System shows: 100 × Rs. 250 = Rs. 25,000
- **System checks stock:** You have 94 bags... Uh oh, only 94, not 100!
- **What to do:** Tell contractor: "I have 94 bags in stock. I can give you those now and order 6 more for next week. Deal?"
- Contractor: "OK, take the 94."
- Update quantity to 94
- Add to cart: Rs. 23,500

**Sand - 40 bags**

- Search/Scan: "Sand 25kg"
- Quantity: 40
- Add: 40 × Rs. 400 = Rs. 16,000
- Check stock: You have 38 bags - Not enough!
- Tell contractor: "I have 38 sand bags. Can you take those?"
- Contractor: "OK"
- Update to 38
- Added: Rs. 15,200

**Nails - 50kg assorted**

- You have 5 types of nails
- Contractor wants mix: some 10mm, some 12mm, etc.
- Ring each type:
  - 10mm nails, 15kg: Rs. 3,000
  - 12mm nails, 10kg: Rs. 2,200
  - 16mm nails, 15kg: Rs. 3,500
  - 20mm nails, 10kg: Rs. 2,500
  - Total nails: Rs. 11,200

**Wire - 20 rolls**

- Search/Scan: "Electrical wire"
- Quantity: 20
- 20 × Rs. 450 = Rs. 9,000
- Stock check: You have 22 rolls ✓ OK

#### Step 3: Cart Summary

```
CART SUMMARY:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Cement 5kg × 94           = Rs. 23,500
Sand 25kg × 38            = Rs. 15,200
Nails - 10mm 15kg         = Rs. 3,000
Nails - 12mm 10kg         = Rs. 2,200
Nails - 16mm 15kg         = Rs. 3,500
Nails - 20mm 10kg         = Rs. 2,500
Electrical Wire × 20      = Rs. 9,000
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Subtotal                  = Rs. 58,900
VAT (15% on applicable)   = Rs. 2,150
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TOTAL                     = Rs. 61,050
```

#### Step 4: Handle Discount Request

- Contractor: "Can you give me 10% off? It's a big order."
- **You can't decide this** - only manager/owner can give discounts
- Call over: "Manager, customer wants 10% discount on this purchase"
- Manager reviews: "Good customer, regular business... OK, approve 10%"
- You click **"Apply Discount"**
- Enter: 10%
- System calculates new total: Rs. 61,050 × 0.90 = **Rs. 54,945**
- Contractor sees: "Saving Rs. 6,105"

#### Step 5: Payment Method

- Contractor: "I'll pay Rs. 30,000 cash now, put Rs. 24,945 on my account"
- Click Payment Type: **"Mixed"**
- Enter:
  - Cash: Rs. 30,000
  - Credit: Rs. 24,945
- System shows: "Credit balance for Ravi's Contractors: Rs. 24,945"

#### Step 6: Complete Sale

- Click: **"Complete Sale"**
- Receipt prints
- Give to contractor
- Say: "Your items are ready. We'll deliver the 6 cement bags we ordered next week."

### What Happened Automatically

✓ **Stock Updated:**

- Cement: 94 → 0
- Sand: 38 → 0
- Nails: Reduced by sent quantity
- Wire: 22 → 2

✓ **System Alerts:**

- "Cement LOW STOCK - reorder needed" ⚠️
- "Sand LOW STOCK - reorder needed" ⚠️
- "Wire down to 2 rolls - low stock" ⚠️

✓ **Customer Updated:**

- Ravi's Contractors now owes: Rs. 24,945
- Next time they visit, you'll see: "Credit balance: Rs. 24,945"

✓ **Sales Record:**

- Sale #2848: Rs. 54,945 (with discount applied)
- Customer: Ravi's Contractors
- Items recorded
- Date & Time: Feb 7, 2PM
- All data saved

✓ **Manager Alert:**

- Manager gets notification: "Need to reorder cement (0 in stock) and sand (0 in stock)"
- Manager knows to call suppliers immediately

### Timeline

- **Total time:** 8-10 minutes for bulk sale
- **System saved time:** If done on paper, would take 30+ minutes with manual calculations and risk of errors

---

## Scenario 3: Customer with Credit

### Situation

It's 4:30 PM. Ravi's Contractors comes back (from scenario 2).

**"Hi, I'm back for more materials. I also need to clear my previous balance."**

He owes Rs. 24,945 from last sale.

### What You Do

#### Step 1: Select Customer

- Click **"Select Customer"**
- Search: "Ravi"
- Click: "Ravi's Contractors"
- **System shows:**
  - Outstanding credit balance: **Rs. 24,945** ← Highlighted in red
  - Last purchase: 2 days ago

#### Step 2: Handle Payment of Previous Balance

- You tell contractor: "Before we process the new order, you have an outstanding balance of Rs. 24,945 from your last purchase."
- Contractor: "Yes, I'll pay that now. Full payment in cash."
- Contractor counts out: Rs. 24,945
- You have two options:

**Option A: Create a separate payment transaction**

- Click: **"Process Payment"**
- Select: Cash
- Amount: Rs. 24,945
- Apply to: "Previous credit balance"
- System shows: "Credit balance cleared ✓ Rs. 0"

**Option B: Let them buy more and adjust on new sale**

- Contractor: "Actually, just add it to my new purchase if I owe less"
- Then continue with new sale (below)

**In this case, Option A - they're paying old debt**

- Contractor pays the Rs. 24,945 cash now
- System updates: Balance = Rs. 0 ✓

#### Step 3: New Purchase - Same Contractor

- Now create a new sale
- Customer still selected: Ravi's Contractors
- Add new items:
  - Cement: 50 bags × Rs. 250 = Rs. 12,500
  - Paint: 10 cans × Rs. 1,200 = Rs. 12,000
  - Total: Rs. 24,500

#### Step 4: Payment for New Sale

- Contractor: "I'll pay Rs. 15,000 now, Rs. 9,500 on credit again"
- Click: **"Mixed"** payment
- Cash: Rs. 15,000
- Credit: Rs. 9,500
- System shows: New credit balance = Rs. 9,500

#### Step 5: Complete Sale

- Click: **"Complete Sale"**
- Two receipts print:
  - Receipt for previous balance payment: Rs. 24,945 paid ✓
  - Receipt for new sale: Rs. 24,500, Rs. 15,000 paid, Rs. 9,500 on credit

### What This Looks Like in System

**Customer History View:**

```
RAVI'S CONTRACTORS
================

Transaction History:
- Feb 7, 2:00 PM: Sale #2848 - Rs. 54,945 (Rs. 30,000 cash, Rs. 24,945 CREDIT)
- Feb 9, 4:30 PM: Payment - Rs. 24,945 (Cleared previous balance)
- Feb 9, 4:35 PM: Sale #2850 - Rs. 24,500 (Rs. 15,000 cash, Rs. 9,500 CREDIT)

CURRENT BALANCE: Rs. 9,500 (Owed to us)
LAST PAYMENT: Feb 9, 4:30 PM
TOTAL SPENT: Rs. 151,445
ACCOUNT STATUS: Active, Good Customer ✓
```

### Why This System Is Better Than Paper

**Without System:**

- Contractor: "What did I owe you?"
- You: "Let me check my notebook..." (rifling through pages)
- Maybe find the information after 5 minutes
- Customer waiting
- You might be wrong

**With System:**

- Contractor: "What did I owe you?"
- You: Click on their name
- Instant: "You owed Rs. 24,945"
- Contractor satisfied
- Takes 5 seconds instead of 5 minutes

---

## Scenario 4: New Product Arrives

### Situation

It's 9:00 AM, before the shop opens. Your delivery truck arrives with new stock from your supplier "Cement Kings Ltd."

**What arrives:**

- 200 bags of 5kg Cement @ Rs. 200 per bag
- 100 bags of 25kg Sand @ Rs. 350 per bag
- 50 boxes of 10mm Steel Nails @ Rs. 180 per box
- 30 rolls of Electrical Wire @ Rs. 425 per roll

### What You Do

#### Step 1: Go to Purchases Section

- Click **"Purchases"** from main menu
- Click **"+ New Purchase"** button
- Form opens

#### Step 2: Select Supplier

- Click: **"Supplier"** dropdown
- Search: "Cement Kings"
- Click to select
- System shows:
  - Phone: 011-234-5678
  - Email: orders@cementkings.lk
  - Terms: Net 30 (you have 30 days to pay)

#### Step 3: Add Received Items

**Item 1: Cement**

- Click **"+ Add Item"**
- Search: "Cement 5kg" (or "Portland Cement")
- Quantity: 200
- Unit: Bags
- Cost per unit: Rs. 200
- Line total: 200 × Rs. 200 = Rs. 40,000
- Batch number: CK-200209-001 (from invoice)
- Expiry: Not applicable (cement doesn't expire like that)

**Item 2: Sand**

- Click **"+ Add Item"**
- Search: "Sand 25kg Bag"
- Quantity: 100
- Cost per unit: Rs. 350
- Line total: 100 × Rs. 350 = Rs. 35,000
- Batch: CK-200209-002

**Item 3: Nails**

- Click **"+ Add Item"**
- Search: "Nails 10mm Steel"
- Quantity: 50
- Cost per unit: Rs. 180
- Line total: 50 × Rs. 180 = Rs. 9,000
- Batch: CK-200209-003

**Item 4: Wire**

- Click **"+ Add Item"**
- Search: "Electrical Wire"
- Quantity: 30
- Cost per unit: Rs. 425
- Line total: 30 × Rs. 425 = Rs. 12,750
- Batch: CK-200209-004

#### Step 4: Review Purchase Summary

```
PURCHASE SUMMARY
Supplier: Cement Kings Ltd
Date: Feb 9, 2026, 9:00 AM
=====================================
Cement 5kg × 200 @ Rs. 200    = Rs. 40,000
Sand 25kg × 100 @ Rs. 350     = Rs. 35,000
Nails 10mm × 50 @ Rs. 180     = Rs. 9,000
Electrical Wire × 30 @ Rs. 425 = Rs. 12,750
=====================================
TOTAL PURCHASE COST            = Rs. 96,750

Supplier Invoice #: CK-8901
Your PO #: PO-2026-214
Expected Payment: Mar 11, 2026 (30 days)
```

#### Step 5: Mark as Received

- Click: **"Mark as Received"** button
- Confirm physically on site:
  - Count cement bags: 200 bags ✓
  - Count sand bags: 100 bags ✓
  - Count nail boxes: 50 boxes ✓
  - Count wire rolls: 30 rolls ✓
- Everything matches invoice ✓
- Click: **"Confirm Receipt"**

#### Step 6: Complete

- System shows: "Purchase #847 - RECEIVED ✓"
- Date: Feb 9, 2026, 9:30 AM
- Status: Received

### What Happened Automatically

✓ **Inventory Updated:**

- Cement: Old stock + 200 = New stock
- Sand: Old stock + 100 = New stock
- Nails: Old stock + 50 = New stock
- Wire: Old stock + 30 = New stock

✓ **Accounting:**

- System tracks: You owe Cement Kings Rs. 96,750
- Due date: Mar 11, 2026 (30 days from purchase)
- Your accountant can pull AP (Accounts Payable) report anytime

✓ **Batch Tracking:**

- Cement now has batch CK-200209-001
- When you sell, tracking follows
- If issue reported with batch, can trace it

✓ **Low Stock Alerts Cleared:**

- "Cement" alert cleared - now have 200 bags ✓
- "Sand" alert cleared - now have 100 bags ✓
- "Nails" alert cleared - now have 50 boxes ✓

✓ **Dashboard Updated:**

- Cost of goods increased: Rs. 96,750
- Manager sees: Fresh stock available

---

## Scenario 5: Customer Asks for a Discount

### Situation

It's 3:00 PM. A customer comes in with multiple items.

**Items:**

- 10 bags of cement @ Rs. 250 each = Rs. 2,500
- 5 cans of paint @ Rs. 1,500 each = Rs. 7,500
- 20 meters of wire @ Rs. 150 each = Rs. 3,000

**Total: Rs. 13,000**

**Customer: "I know a competitor down the street charging less. Can you match it? Can you give me 15% off?"**

### What You Do

#### Step 1: Ring up the Sale (Don't Apply Discount Yet)

- Add all items to cart
- Total shows: Rs. 13,000
- Payment method selected

#### Step 2: Customer Asks for Discount

- You **cannot approve discounts yourself**
- You must get manager/owner approval
- Call over: "Manager!"

#### Step 3: Manager Evaluates

Manager asks questions:

- Is this a regular customer? (Good for repeat business)
- How much profit margin do we have? (Can we afford 15%?)
- Is competitor pricing real? (Sometimes customers exaggerate)
- Customer's payment history? (Reliable or problem?)

Manager decides: "15% is too much. But for this customer, I'll give 10%."

#### Step 4: Apply Discount in System

- Manager comes to counter
- Clicks: **"Apply Discount"** button
- Enters: 10%
- System recalculates: Rs. 13,000 × 0.90 = **Rs. 11,700**
- Customer saves: Rs. 1,300
- New total: Rs. 11,700

#### Step 5: Note the Reason

- System may ask: "Reason for discount?"
- Enter: "Good customer, volume purchase, competitive pressure"
- This helps for auditing later

#### Step 6: Complete Sale

- Payment processed at Rs. 11,700 (not Rs. 13,000)
- Receipt shows:
  - Subtotal: Rs. 13,000
  - Discount: -Rs. 1,300 (10%)
  - **Total: Rs. 11,700** ← Final amount

#### Step 7: Customer Satisfaction

- Customer: "Thank you! I'll come back."
- You: "Great, see you soon!"
- Happy customer, competitive sale completed

### Why Manager's Approval Matters

**Without Approval System:**

- Cashier might give 20% discount to every customer
- Store loses Rs. 2,600 profit on this sale
- × 50 sales per day = Rs. 130,000 lost PER DAY
- That's your profit gone!

**With Approval System:**

- Manager decides: what discounts make sense
- Smart discounts for good customers
- Protects store profit
- Training for newer staff

---

## Scenario 6: Stock is Running Low

### Situation

It's Thursday, 2 PM. Lots of customers buying cement. You notice stock is getting low.

### What You Do

#### Step 1: Check Current Stock

- In POS, when you scan cement:
  - Shows: "Cement 5kg - Available: 6 bags"
  - Also shows: "⚠️ LOW STOCK" warning
  - (Because low stock level was set to 20 bags)

**Or manually check:**

- Click **"Inventory"**
- Search: "Cement"
- Shows: 6 bags in stock (against low-stock level of 20)

#### Step 2: Alert Manager

- Call over manager: "Cement is critically low, only 6 bags left"
- Manager checks: "OK, I'll call supplier right now"

#### Step 3: Manager Places Emergency Order

- Goes to Suppliers section
- Finds: Cement Kings
- Calls: 011-234-5678
- Asks: "Can you deliver 100 bags of cement today or tomorrow?"
- Supplier: "Yes, can deliver by tomorrow 10 AM"
- "Perfect, add to invoice"

#### Step 4: System Helps

- Manager goes to **Purchases > New Purchase**
- Selects Supplier: Cement Kings
- Adds: 100 bags cement
- Marks: "Emergency order for tomorrow delivery"
- Saves as draft (or sends if system has supplier integration)

#### Step 5: What Happens While Waiting

- If more customers want cement, you have 6 bags max
- You tell customer: "I have 6 bags in stock. We're ordering more for tomorrow."
- Customer can wait or take the 6
- System tracks: these customers wanted cement but it was low stock

#### Step 6: Next Morning - Stock Arrives

- Delivery truck arrives
- You record in Purchases: 100 bags received
- Stock updates: 6 + 100 = 106 bags ✓
- Alert clears: No more low-stock warning
- Manager knows emergency solved

### System Benefits in This Scenario

✓ **You spotted it instantly** - system showed "6 bags"  
✓ **Manager ordered immediately** - avoid losing customers  
✓ **Emergency noted** - system tracks why reorder was needed  
✓ **No customer lost** - most stayed to wait for next-day delivery

**Without system:**

- Might not notice till you're completely out
- Customer leaves angry
- Opportunity lost

---

## Scenario 7: A Customer Returns Something

### Situation

It's Friday morning. A customer comes in upset.

**"Hi, I bought paint from you yesterday (Rs. 12,000 for 10 cans). I opened one can and the paint quality is not good. I want my money back and to return all 10 cans."**

### What You Do

#### Step 1: Check Their Purchase

- Click **"Customers"**
- Search for customer
- Click to view history
- You see: "Sale #2871, Yesterday 4:15 PM, Rs. 12,000 for 'Premium Paint' 10 cans"

#### Step 2: Assess the Return

- Good customer (maybe)
- Valid complaint (quality issue)
- Product is intact (not damaged by them)
- Does manager want to process return?

#### Step 3: Manager Approves Return

- Call manager over
- Manager checks paint can
- Confirms: defective batch
- Decision: "Process a return, give full refund"

#### Step 4: Create Return in System

- Go to **POS**
- Click **"New Return"** (or "Credit Memo")
- Select customer
- Search for previous sale: "Sale #2871"
- System loads: Premium Paint × 10 @ Rs. 1,200 each

#### Step 5: Process the Return

- Select items being returned:
  - Premium Paint: qty 10
- System shows:
  - Return amount: Rs. 12,000
  - Reason: Defective/Quality issue
  - Refund method: Cash (back to them)

#### Step 6: Complete Return

- Click: **"Process Return"**
- System shows: "Credit memo #CM-847 created"
- Refund: Rs. 12,000
- Give cash back to customer OR apply to new purchase

#### Step 7: What Happens Automatically

✓ **Inventory Updated:**

- Premium Paint: If taken back physically, stock increases by 10

✓ **Sales Corrected:**

- Sale #2871 marked as "Returned"
- Rs. 12,000 refunded
- Daily sales decreased by this amount (if still same day)

✓ **Customer History:**

- Shows: Sale on Thursday, Return on Friday
- Note: Defective batch
- New balance: Rs. 0 (if they had credit)

✓ **Supplier Tracking:**

- Manager notes: "Batch defective - contact supplier"
- May request credit from Cement Kings for batch
- Helps improve supplier quality

### System vs Manual

**Manual System:**

- Customer comes back...do you even have last receipt?
- Calculate refund: maybe get it wrong
- Update notebook
- Update stock on notebook (probably forget)
- Supplier doesn't get feedback

**Digital System:**

- 30 seconds to find sale
- Automatic refund calculation
- Instant stock update
- Supplier feedback tracked
- Proper documentation

---

## Scenario 8: Month-End Financial Check

### Situation

It's February 28th, 5:00 PM. Owner wants to see how the month went before closing.

### What You Do

#### Step 1: Go to Dashboard

- Click **"Dashboard"**
- System shows summary view:
  - **Sales Today:** Rs. 45,000
  - **Sales This Month:** Rs. 1,485,000
  - **Profit This Month:** Rs. 445,000 (estimated)
  - **Transactions Today:** 92
  - **Transactions Month:** 2,150
  - **Customers Served Today:** 38
  - **New Customers This Month:** 12

#### Step 2: Get Detailed Reports

- Click **"Reports"** menu
- Select: **"Sales Summary"**
  - Choose date range: Feb 1 - Feb 28

```
FEBRUARY SALES SUMMARY
================================
Week 1: Rs. 325,000
Week 2: Rs. 385,000
Week 3: Rs. 410,000
Week 4: Rs. 365,000
================================
TOTAL: Rs. 1,485,000

Best Day: Feb 14 (Saturday) - Rs. 68,000
Slowest Day: Feb 8 (Wednesday) - Rs. 32,000
Average per day: Rs. 52,330
```

#### Step 3: Check Inventory Report

- Click: **"Inventory Report"**
- Shows:
  - Total inventory value: Rs. 425,000
  - SKU count: 67 products
  - Low stock items: 5 (need reordering)
  - Best sellers (by quantity): Cement, Nails, Wire
  - Best sellers (by revenue): Paint, Wire, Fixtures

#### Step 4: Check Financial Performance

- Click: **"Financial Summary"**

```
FEBRUARY FINANCES
================================
Revenue:
  POS Sales:           Rs. 1,485,000
  Credit Collections:  Rs. 85,000
  Total Income:        Rs. 1,570,000

Expenses:
  Purchases (COGS):    Rs. 945,000
  Rent:                Rs. 50,000
  Utilities:           Rs. 15,000
  Salaries:            Rs. 95,000
  Other:               Rs. 20,000
  Total Expenses:      Rs. 1,125,000

PROFIT:
  Gross Profit:        Rs. 625,000
  Net Profit:          Rs. 445,000

Profit Margin:         29.8%
Growth vs Jan:         +15%
```

#### Step 5: Check Receivables (Money Owed)

- Click: **"Customers"** > "Credit Summary"

```
CREDIT STATUS - WHO OWES US MONEY
================================
Ravi's Contractors:      Rs. 24,945 (Due 10 days)
ABC Repairs:             Rs. 8,500 (Due 2 days)
Sharma Renovations:      Rs. 15,750 (Due 5 days)
Silva Enterprises:       Rs. 22,300 (Overdue 3 days)
================================
Total Outstanding:       Rs. 71,495
Expected to collect:     Rs. 60,000 (by Mar 10)
At Risk:                 Rs. 11,495 (overdue)
```

#### Step 6: Owner Reviews and Makes Decisions

Owner sees:

- ✓ Sales up 15% from January - good!
- ✓ Profit margin healthy at 29.8%
- ⚠️ Silva Enterprises Rs. 22,300 overdue - need to follow up
- ↗️ Cement and Nails are bestsellers - stock more next month
- ↘️ Paint items selling slowly - consider promotion or lower price
- ✓ New customers: 12 this month - good marketing working

#### Step 7: Owner Takes Action

- Calls Silva Enterprises about overdue payment
- Notes to manager: "Increase cement order for March"
- Notes to manager: "Run paint promotion week - 10% off"
- Decides: Profit good, maybe bonus for staff in March
- Files financial summary for accountant

### What Owner Now Knows (From 5-Minute Review)

✓ Is business profitable? **YES - 29.8% margin** ✓  
✓ Am I meeting targets? **YES - up 15% from Jan** ✓  
✓ What's selling best? **Cement, Nails, Wire** → Order more  
✓ What's slow? **Paint items** → Promote or reduce  
✓ Who owes us? **Rs. 71,495 outstanding** → Follow up  
✓ Are customers happy? **12 new customers** → Yes! ✓  
✓ Can I give bonuses? **Yes, profit is good** ✓  
✓ Should I expand? **Maybe - growth is strong** ✓

---

## Key Lessons from These Scenarios

### 1. System Saves Time

- Simple sales: 3 minutes instead of 10
- Bulk sales: 8 minutes instead of 30+
- Lookups: 5 seconds instead of 5 minutes

### 2. System Prevents Errors

- Math is always correct (no calculation mistakes)
- Tax is automatically applied
- Stock is accurate
- Nothing gets double-sold

### 3. System Improves Decision Making

- See profit in seconds (don't have to wait for accountant)
- Know what's selling (base ordering on data, not guesses)
- Spot trends early (low stock alerts, sales trends)
- Make better business decisions

### 4. System Provides Accountability

- Track who sold what
- Each cashier's sales separate
- Discounts logged and approved
- Inventory audits easy

### 5. System Enhances Customer Experience

- Faster checkout
- Professional invoices
- Can track customer history
- Credit system protects good customers

---

## Common Mistakes to Avoid

❌ **Don't forget to scan VAT items**

- Some items need tax
- Don't manually calculate - use the system

❌ **Don't guess at quantities**

- Check physical items before confirming
- "5 boxes" might actually be 4.5

❌ **Don't forget to mark receipts received**

- Stock doesn't update if you don't mark received
- System is real-time: mark immediately

❌ **Don't give discounts without approval**

- Only manager can approve
- Protects store profit

❌ **Don't ignore low-stock alerts**

- System tells you when to reorder
- Ignoring means stock-out

❌ **Don't delete sales (for corruption)**

- System tracks who, when, why
- Always use proper returns process
- Audit trail protects everyone

---

## Summary

These scenarios show how the system:

1. **Simplifies** - Complex tasks become simple clicks
2. **Protects** - Prevents errors and fraud
3. **Informs** - Gives business insights instantly
4. **Empowers** - Helps you make better decisions
5. **Satisfies** - Customers get quick, professional service

The more you use it, the more natural it becomes, and the more your shop will benefit.

---

**Remember:** If you're ever unsure, ask your manager. That's what they're there for!

---

_Document Version: 1.0_  
_Last Updated: February 10, 2026_
