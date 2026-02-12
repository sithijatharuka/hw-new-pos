# How Your Hardware Shop POS System Works

## Complete Guide for Non-Technical Users

---

## 📚 Table of Contents

1. [What Is This System?](#what-is-this-system)
2. [How Does It Work Overall?](#how-does-it-work-overall)
3. [Getting Started: Login](#getting-started-login)
4. [Main Features Explained](#main-features-explained)
5. [How Features Work Together](#how-features-work-together)
6. [Common Workflows](#common-workflows)
7. [Understanding User Roles](#understanding-user-roles)

---

## 🎯 What Is This System?

This is a **Point-of-Sale (POS) system** for hardware shops in Sri Lanka. Think of it as a smart computerized replacement for a cash register and notebook.

Instead of manually writing down sales, managing stock on paper, and doing math by hand, this system helps you:

- ✅ Ring up sales quickly and accurately
- ✅ Keep track of what you have in stock
- ✅ Remember customer information
- ✅ Manage your suppliers
- ✅ See how your business is doing
- ✅ Track your expenses
- ✅ Print receipts and invoices

### Why Is This Better Than Paper?

| Task                       | On Paper                              | With This System                          |
| -------------------------- | ------------------------------------- | ----------------------------------------- |
| Selling an item            | Write it down, calculate tax, do math | Select item, tax calculated automatically |
| Finding stock levels       | Check notebook or count shelves       | See exact numbers instantly               |
| Creating an invoice        | Write by hand, calculate totals       | Automatic, printed perfectly              |
| Checking sales today       | Count receipts, add them up manually  | Click one button, see the exact total     |
| Finding a customer's phone | Search through notebook               | Search in one second                      |

---

## ⚙️ How Does It Work Overall?

### The System Has Two Parts

#### **Part 1: The Screen (Frontend)**

This is what you see and use on your computer. It's clean, colorful, and easy to navigate. You click buttons, type information, and see results.

#### **Part 2: The Brain (Backend)**

This part you never see. It's the computer power that:

- Stores all your information (sales, stock, customers, etc.)
- Does all the calculations (math, taxes, totals)
- Remembers everything you do
- Keeps your data safe and organized
- Sends you back the right information when you ask for it

### How They Communicate

1. You click something on the screen
2. The screen sends a request to the brain
3. The brain processes it and stores/retrieves information
4. The brain sends the answer back
5. The screen shows you the updated information

**Example:** You create a sales and click "Save"

- Screen: "Here's the sale with 5 items, total Rs. 15,000"
- Brain: "Got it! I'll save this, calculate the tax, update stock, and send you a receipt number"
- Screen: Shows "Sale saved! Receipt #1234 - Go to print it"

---

## 🔐 Getting Started: Login

### Why You Need to Log In

The system needs to know who you are because:

- Different people have different access levels
- It tracks who made which sales
- It keeps sensitive information secure
- It remembers your preferences

### The Login Process

1. **You open the application** on your computer
2. **You see the Login page** with two boxes (Username and Password)
3. **You enter your credentials** (what the owner gave you)
4. **The system checks** if you're a real user
5. **It checks your password** to make sure it's correct
6. **You're logged in!** Now you see the main menu based on what you're allowed to do

### Who Can Do What

Not everyone has access to every feature. Think of it like a hardware shop:

- A **cashier** rings up sales
- A **manager** also manages inventory and sees reports
- The **owner** can see and do everything

---

## 📋 Main Features Explained

### 1. **Dashboard** 📊

**What It Does:** Shows you the health of your business at a glance

**What You See:**

- Total sales for today, this week, this month
- Number of customers served
- Top-selling items
- Key statistics
- Quick health check

**When to Use It:**

- First thing in the morning to see how you're doing
- Before a meeting with the owner
- When you want to understand trends

**Simple Analogy:** Like checking the fuel gauge, temperature, and mileage on your car dashboard while driving.

---

### 2. **POS (Point of Sale)** 🛒

**What It Does:** Where you ring up sales - it's your virtual cash register

**How It Works Step-by-Step:**

1. **Customer comes to the counter with items**
2. **You scan or select each item** from your inventory
3. **The system shows** the item name, price, and current quantity in stock
4. **You enter the quantity** the customer wants to buy
5. **The system automatically** calculates:
   - The line total (price × quantity)
   - Automatically applies discounts if needed
   - Automatically calculates VAT (tax) if the item is taxable
6. **You review the total** - everything is summed up
7. **You select the payment method** (Cash, Card, Bank Transfer, Credit, or Mixed)
8. **You click "Save Sale"**
9. **The system:**
   - Reduces the stock levels automatically
   - Records the customer information
   - Generates a receipt number
   - Updates your daily sales numbers
   - Prepares a receipt
10. **You print the receipt** (thermal 80mm receipt or A4 invoice)
11. **Customer gets their receipt**

**Smart Features:**

- **Barcode scanning:** Just scan the barcode on the item, it automatically adds it
- **Quick search:** Type an item name to find it instantly
- **Stock checking:** You see if you have enough before selling
- **Automatic tax:** If an item should have tax, it's added automatically
- **Multiple payment types:** Customer paying partly cash, partly card? No problem

**Common Scenarios:**

_Scenario 1: Regular Sale_

- Customer buys 10 bags of cement at Rs. 450 each
- You click POS > scan cement > enter qty 10
- System shows: 10 × 450 = 4,500 (+ any VAT if applicable)
- Customer pays Rs. 4,500 (or 5,000 with VAT)
- Receipt is printed

_Scenario 2: Bulk Sale with Discount_

- Customer is a contractor, buying in bulk
- You add 20 items, system shows total Rs. 50,000
- Contractor says "Can you give 5% discount?"
- You apply 5% discount in the system
- System shows new total Rs. 47,500 (or with VAT)
- Customer pays

_Scenario 3: Mixed Payment_

- Total is Rs. 10,000
- Customer says "I'll pay Rs. 6,000 now, rest on credit"
- You select "Mixed" payment
- Enter Rs. 6,000 cash, and Rs. 4,000 credit
- System records this, and will remind you they owe Rs. 4,000 next time they visit

---

### 3. **Inventory** 📦

**What It Does:** This is your digital warehouse - where you track all products

**What You Can Do:**

**Add New Product:**

1. Click "Add Item" button
2. Enter product details:
   - **Item name** - what is it? (Cement, Paint, Wire, etc.)
   - **SKU** - internal code to identify it (like MP001 for Metal Pipes)
   - **Barcode** - the barcode from the manufacturer
   - **Category** - what type of product? (Building Materials, Tools, Paint, etc.)
   - **Unit** - how do you sell it? (Pieces, Bags, Meters, Kilograms, etc.)
   - **Selling price** - how much you charge customers
   - **Cost price** - how much it costs you (for profit calculations)
   - **Opening stock** - how many you started with
   - **Low stock level** - when to reorder? (alert you if stock falls below this)
   - **Image** - optional picture of the product
   - **VAT applicable** - should this item have tax charged?

**Edit Product:**

- Click the "Edit" button next to any product
- Change any of the information above
- Save changes

**Delete Product:**

- Click "Delete" button
- Confirm you want to remove it
- It's gone

**Print Barcode:**

- Click "Print Barcode" button
- A printable label with the barcode appears
- Print it on a label printer
- Stick it on the actual product in your shop

**Search Products:**

- Use the search box to quickly find any product
- Type product name, SKU, or barcode
- Results appear instantly

**Why This Matters:**

- You always know what you have in stock
- When stock runs too low, you know to reorder
- You can see which items make you the most profit
- You can track slow-selling items and adjust pricing

**Real Example:**
You stock "10mm Steel Nails" - 100 bags at Rs. 200 each cost

- Add it: Name = "10mm Steel Nails", SKU = "NAIL-10MM", Cost = Rs. 200, Selling Price = Rs. 280
- Stock = 100 bags, Low Level = 10 bags
- When you sell nails in POS, the stock automatically decreases
- Once stock drops to 10 bags, the system alerts you: "Low stock on 10mm Steel Nails"
- You order more from your supplier

---

### 4. **Suppliers** 🏭

**What It Does:** Keeps track of all the companies you buy from

**What You Store:**

- Supplier name
- Contact person name
- Phone number
- Email
- Address
- Payment terms (if applicable)
- Notes (special instructions, delivery days, etc.)

**Why You Need This:**

- Quick access to supplier contact info
- Easy to place orders
- Reference for payments
- Track communication

**Real Scenario:**
You need to order cement urgently. Instead of searching for the supplier's number, you:

1. Go to Suppliers
2. Search for "Cement Kings Limited"
3. See their phone: 011-234-5678
4. Call them
5. Or click their email to send an order

---

### 5. **Purchases** 📥

**What It Does:** Records all the items you buy from suppliers

**How It Works:**

1. **You receive an order** from a supplier
2. **You record the purchase:**
   - Supplier name
   - List of items received
   - Quantity of each
   - Price you paid per unit
   - Total cost
3. **You check the items** - do they match the invoice?
4. **You mark it received** in the system
5. **The system automatically updates:**
   - Your inventory increases
   - You track your spending
   - You know your cost prices

**Real Scenario:**
Monday morning, cement delivery arrives:

- **Before system:** You count bags, update notebook, manually add to inventory
- **With system:**
  - You go to Purchases > New Purchase
  - Select supplier "Cement Kings"
  - Add items: "10mm Steel Nails" × 50 bags @ Rs. 200 = Rs. 10,000
  - Click "Receive Purchase"
  - Instantly, your stock goes from 10 bags to 60 bags
  - System records the purchase cost
  - You can see this for your accountant later

---

### 6. **Customers** 👥

**What It Does:** Keeps track of people who buy from you

**What You Store:**

- Customer name
- Phone number
- Email
- Address
- How much credit they owe you (if any)
- When they last bought something

**Why This Is Useful:**

_Scenario 1 - Contractor Comes Back_

- He asks: "What did I charge you last time for labor?"
- You search for him: "Ravi Construction"
- You see: Last purchase was Rs. 5,500 for paint thinner
- You remember and tell him
- He's impressed you remembered!

_Scenario 2 - Credit Customer_

- Supplier buys Rs. 20,000 worth of tools on credit
- You see his balance: Rs. 20,000 payable
- Two weeks later he comes back to buy more
- System shows: "This customer owes Rs. 20,000"
- You decide: "Pay the old debt first, then I'll sell you more"
- He pays, system updates balance to Rs. 0

_Scenario 3 - Regular Customer_

- Person comes in, maybe you don't recognize them
- You're at POS, you click "Select Customer"
- You search for them
- System shows their history
- You see they buy nails every week

---

### 7. **Reports** 📈

**What It Does:** Shows you business data in different ways

**Types of Reports:**

**Sales Report:**

- See all sales for a date range
- Grouped by day, week, or month
- Shows revenue trend
- Example: "February 1-10 had Rs. 250,000 in sales"

**Inventory Report:**

- Stock levels of all products
- Which items are low
- Which items have high stock
- Helps you decide what to reorder

**Customer Report:**

- Money owed by credit customers
- Customer purchase history
- Best customers

**Financial Report:**

- How much you made (revenue)
- How much you spent (costs)
- Your profit/loss
- Cash flow summary

**Why You Need This:**

- Understand your business performance
- Make decisions about pricing and stocking
- Prepare reports for the accountant
- See if you're making money
- Predict future needs

**Real Example:**
End of week, the owner asks: "How did we do?"

- You go to Reports > Sales Summary
- Click "Last 7 days"
- Shows: Rs. 125,000 in sales
- 250 items sold
- Average sale: Rs. 500
- Best day: Saturday (Rs. 28,000)
- Owner is happy and gives you a bonus!

---

### 8. **Expenses** 💸

**What It Does:** Tracks money you spend on the business

**What You Can Record:**

- Rent for the shop
- Electricity bill
- Staff salaries
- Equipment repairs
- Office supplies
- Cleaning costs
- Any other business expense

**How to Use It:**

1. Click "Add Expense"
2. Select category (Rent, Utilities, Repairs, etc.)
3. Enter description and amount
4. Save

**Why It Matters:**

- Know exactly what you spend
- Calculate true profit (Revenue - ALL Expenses = Real Profit)
- For tax authorities
- Helps with budgeting

**Real Example:**
You spend Rs. 50,000 / month on rent. Without tracking:

- You think you made Rs. 300,000 (all sales)
- But you actually made Rs. 250,000 (after rent)
- Big difference!

With the system:

- You see sales: Rs. 300,000
- You see expenses: Rs. 50,000 (rent)
- You see real profit: Rs. 250,000
- You can make better decisions about hiring staff or buying more stock

---

### 9. **Settings** ⚙️

**What It Does:** Stores shop configuration

**What You Set Up:**

- **Shop name** - your hardware store's name
- **Shop address** - where you're located
- **Phone number** - your main contact number
- **Registration number** - if applicable
- **VAT percentage** - the tax rate to apply (usually 15% in Sri Lanka)
- **Shop logo** - for invoices and receipts

**Why This Matters:**

- Used on all printed invoices and receipts
- Customers see your information
- Tax calculation is correct across all sales

**Real Example:**
You print an invoice. At the top it shows:

- "ABC Hardware Store"
- "123 Main Street, Colombo"
- "Tel: 011-123-4567"
- VAT Reg: [Your registration]

This information comes from Settings. If you move shops, you update it once and all future invoices reflect the change.

---

### 10. **Users** 👤

**What It Does:** Manages your staff accounts

**What the Owner can do:**

**Create New Staff Account:**

1. Click "Add Staff"
2. Enter their details:
   - Full name
   - Username (for login)
   - Password
   - Phone number
3. Assign a role:
   - **Cashier** - Can ring up sales and access customer info (most restricted)
   - **Manager** - Can manage inventory, view reports, see expenses
   - **Owner/Admin** - Can do everything, including managing users
4. Select features they're allowed to use
5. Save

**Edit Staff Account:**

- Click "Edit" on any staff member
- Update their information
- Change their access level
- Change features they can access

**Deactivate Staff:**

- Instead of deleting, you can disable their account
- They can't log in anymore
- Their sales history remains in the system

**Real Example - New Cashier:**
You hire Kasun as a cashier.

1. Go to Users > Add Staff
2. Name: Kasun Perera
3. Username: kasun.p
4. Password: (give him a temporary one)
5. Role: Cashier
6. Features: Dashboard, POS, Customers (only what he needs)
7. Save
8. Tell Kasun his username and password
9. He logs in and can only see POS and Customer sections
10. He can't access Inventory or Reports - he just rings up sales

---

## 🔄 How Features Work Together

The system is like a well-oiled machine where each part affects the others:

### The Circle of Business Activity

```
1. SUPPLIER SENDS GOODS
   ↓
2. YOU RECORD IN "PURCHASES"
   ↓ (Stock automatically increases)
3. INVENTORY UPDATED
   ↓
4. CUSTOMERS BUY IN "POS"
   ↓ (Stock automatically decreases)
5. CUSTOMERS RECORDED
   ↓
6. REPORTS SHOW WHAT HAPPENED
   ↓
7. YOU ORDER MORE FROM SUPPLIERS
   ↓ (Back to step 1)
```

### Example: Life of One Product

Let's follow a bag of cement through the system:

**Day 1 - Supplier Delivers**

- Supplier delivers 100 bags of cement
- You go to Purchases section
- Record: "Received 100 bags from Cement Kings @ Rs. 200 each"
- System updates: Inventory shows 100 bags of cement (Stock increased)

**Day 2 - Customer Buys**

- First customer comes, needs 10 bags
- You go to POS
- Scan/select cement: 10 bags
- System shows: 10 × 280 = Rs. 2,800 (280 is selling price)
- Customer pays
- System updates: Inventory now shows 90 bags (100 - 10 = 90)
- Customer details recorded

**Day 3-5 - More Sales**

- More customers buy cement
- 15 bags sold on Day 3 (75 remaining)
- 20 bags sold on Day 4 (55 remaining)
- 12 bags sold on Day 5 (43 remaining)
- System tracks every sale in Sales Report
- Total revenue from cement: Rs. 13,580 (for those 47 bags sold)

**Day 6 - Stock Alert**

- Stock drops to 43 bags
- Remember: Low stock level was set to 50
- System alerts: "Cement stock is low - consider reordering"
- Manager is informed to place a new order

**Day 7 - Year End Report**

- Owner asks: "How much cement did we sell this year?"
- Go to Reports > Sales by Product
- Shows: "Cement: 500 bags, Revenue: Rs. 140,000, Cost: Rs. 100,000, Profit: Rs. 40,000"
- Owner decides: "Cement is our best seller, stock more of it"

---

## 🎯 Common Workflows

### Morning Opening Routine

**Time: 8:00 AM**

1. **Manager logs in**
2. **Checks Dashboard**
   - "Good, sales were Rs. 45,000 yesterday"
   - "Stock levels look normal"
3. **Checks Inventory**
   - "We're low on nails, need to order"
   - "Calls supplier to place urgent order"
4. **Ready for the day**
   - Staff arrive and log in
   - System is ready for sales

---

### A Customer's Shopping Journey

**Time: 10:30 AM - Contractor Comes In**

**Reality Without System:**

- Staff tries to remember what this customer bought last time
- Staff writes items and prices on paper
- Manual adds up the total
- Mistakes might happen
- Takes 10-15 minutes for 5 items

**With This System:**

1. **Contractor arrives** with his list
2. **Cashier opens POS**
3. **Searches for customer** - "Ravi Construction"
   - System shows: Last bought for Rs. 5,500 last week
   - Shows outstanding credit: Rs. 0 (all paid)
4. **Starts ringing up items:**
   - 5 bags cement: Rs. 1,400
   - 20 kg nails: Rs. 3,500
   - 5 rolls wire: Rs. 2,250
   - System automatically adds: Total Rs. 7,150
5. **Checks for discounts:**
   - Good customer, give 5%
   - System shows new total: Rs. 6,792.50
6. **Payment:**
   - Contractor pays Rs. 3,000 now, wants Rs. 3,792.50 on credit
   - System records this
7. **Receipt:**
   - Click "Print Receipt"
   - Perfect thermal receipt prints with all items and amounts
8. **Done** - Total time: 3 minutes

**System automatically:**

- Decreases stock by what was sold
- Records the customer purchase
- Sets up a reminder about the Rs. 3,792.50 credit owed
- Adds to the day's sales total
- Calculates your profit margin

---

### End of Day Closing

**Time: 6:00 PM - Shop Closing**

**Without System:**

- Count cash in register (might be wrong)
- Add up all receipts (takes time)
- Update notebook with sales
- Handle discrepancies manually
- Hope you didn't make mistakes

**With This System:**

1. **Manager clicks "Daily Close"**
2. **System shows:**
   - Total sales today: Rs. 125,000
   - Total items sold: 245
   - Total customers served: 38
   - Total VAT collected: Rs. 18,750
3. **Checks payment methods:**
   - Cash: Rs. 90,000
   - Card: Rs. 25,000
   - Credit (pending): Rs. 10,000
4. **Counts physical cash in register** - should be Rs. 90,000
5. **If it matches:** "Perfect! Process complete."
6. **If it doesn't match:** System helps find the discrepancy
7. **System generates:**
   - Daily summary
   - Stock status report
   - Next day's alerts
   - Financial summary

**Result:** All accurate, recorded, and ready for tomorrow.

---

### Month-End Financial Review

**Time: February 28th - Owner Reviews Performance**

1. **Owner logs in**
2. **Goes to Reports**
3. **Selects: February 1-28**
4. **System shows:**
   - **Revenue:** Rs. 1,500,000 (from sales)
   - **Expenses:** Rs. 300,000 (rent, utilities, salaries, etc.)
   - **Profit:** Rs. 1,200,000
   - **Best seller:** Cement (Revenue: Rs. 450,000)
   - **Slowest seller:** Paint thinner (Revenue: Rs. 25,000)
5. **Owner calculates:**
   - If I removed slow sellers and stocked more cement
   - I could potentially make Rs. 1,350,000
6. **Owner decides:**
   - Reduce paint thinner orders
   - Increase cement orders
   - Highest-demand customers are contractors

---

### Handling a Stock Count (Audit)

**Situation: Once a quarter, do a physical count to match system**

**Process:**

1. **Manager goes to Inventory Report**
   - System says: "Cement: 150 bags" "Nails: 500 packets" etc.

2. **Physical count in shop:**
   - Team counts actual items on shelves
   - Finds: "Cement: 148 bags" (2 bags missing!)
   - Finds: "Nails: 501 packets" (1 extra - donation?)

3. **Go to Inventory in system**
   - Edit cement: Change 150 to 148
   - Edit nails: Change 500 to 501
   - Add note: "Physical count audit - 2 bags unaccounted"

4. **System updated** - now matches reality

**Why This Matters:**

- If discrepancies are large, something is wrong (theft, waste, system error)
- If small (1-2 items), normal breakage/donation
- Regular audits keep system accurate and trustworthy

---

## 👥 Understanding User Roles

The system has different access levels so staff see only what they need:

### Role 1: CASHIER 💰

**What They Do:** Ring up sales

**What They Can See:**

- ✅ Dashboard (view only - see sales numbers)
- ✅ POS (full access - ring up sales)
- ✅ Customers (view - look up customer names and phone)

**What They CANNOT See:**

- ❌ Inventory (can't manage stock)
- ❌ Suppliers (can't order)
- ❌ Reports (can't see financial data)
- ❌ Settings (can't change shop config)
- ❌ Users (can't manage other staff)

**Why?**

- They only need to ring up sales
- Too much access would confuse them
- Protects sensitive financial information
- Security: no accidental changes

**Real Example:**
Kasun (cashier) logs in:

- He sees: Dashboard, POS, Customers
- He doesn't see: Inventory, Reports, Users
- He can ring up a sale, but can't change product prices
- Perfect for his job

---

### Role 2: MANAGER 📊

**What They Do:** Manage operations, see financial data, manage inventory

**What They Can See:**

- ✅ Dashboard (full access)
- ✅ POS (can ring up sales)
- ✅ Inventory (manage products, stock levels)
- ✅ Suppliers (manage supplier info)
- ✅ Purchases (record incoming stock)
- ✅ Customers (full access to customer info)
- ✅ Reports (see sales, inventory, financial reports)
- ✅ Expenses (record and manage business expenses)

**What They CANNOT See:**

- ❌ Settings (can't change shop config)
- ❌ Users (can't manage staff accounts)

**Why?**

- They run the day-to-day business
- They need to see financial performance
- They manage inventory but don't handle accounts
- They can't change who has access (owner does that)

**Real Example:**
Amara (manager) logs in:

- She rings up sales like a cashier
- She also checks stock levels before ordering
- She reviews daily sales reports
- She sees what the shop spent on expenses
- She makes decisions about restocking
- She can't hire new staff or change their access

---

### Role 3: OWNER/ADMIN 🔑

**What They Do:** Everything - complete control

**What They Can See:**

- ✅ Dashboard (full access)
- ✅ POS (can ring up sales)
- ✅ Inventory (full access)
- ✅ Suppliers (full access)
- ✅ Purchases (full access)
- ✅ Customers (full access)
- ✅ Reports (full access)
- ✅ Expenses (full access)
- ✅ Settings (can configure shop details)
- ✅ Users (can hire, fire, change access levels for staff)

**Why?**

- They own the business
- They make the final decisions
- They manage staff and security
- They configure the system
- They see all confidential information

**Real Example:**
Ravi (owner) logs in:

- He can do everything any staff can do
- He also can hire new cashiers
- He can remove managers who left
- He can change what features different staff can access
- He can see all financial data
- He can change shop settings

---

### Feature Permissions (Advanced)

Modern systems also let owners customize exactly which features each person can access.

**Example:**
Owner might give a junior manager access to:

- Dashboard ✓
- POS ✓
- Inventory ✓
- Purchases ✓
- Customers ✓
- Reports ✓ (but NOT Expenses)
- Suppliers ✓ (but can't edit prices)

This gives fine-grained control while maintaining security.

---

## 🔒 Security & Privacy

### Why Security Matters

Your business data is valuable:

- **Sales figures** - your profit information
- **Customer data** - their phone and addresses
- **Supplier information** - who gives you best prices
- **Staff information** - their wages, etc.

### How This System Protects You

**1. Passwords**

- Each staff member has their own password
- Password is secure (never sent by email)
- If someone forgets, owner can reset it

**2. Login Authentication**

- System verifies username and password
- Only correct staff can log in
- System logs who did what and when

**3. Access Control**

- Cashier can't see Reports (financial data)
- Manager can't change shop Settings
- Only Owner can manage staff accounts
- Each person only sees what they need

**4. Data Encryption**

- Money values stored securely
- Passwords hashed (cannot be reversed)
- Database protected

**5. Activity Logging**

- System tracks who did what and when
- If something goes wrong, can see what happened
- Audit trail for accountants

---

## 💡 Common Questions Answered

### Q: What if a staff member is sick and I need someone else to ring up sales?

**A:** Any staff with POS access can do it. Owner can quickly add them.

### Q: What if I move the shop to a new location?

**A:** Go to Settings, update the address. All future invoices will show new location.

### Q: What if I want to use a different tax rate?

**A:** Go to Settings, change VAT percentage. All new sales use the new rate.

### Q: What if I have a sale for a new customer but forget to add them first?

**A:** No problem. In POS, you can add a quick customer on the spot. Name and phone number.

### Q: Can I find out what a specific customer bought last month?

**A:** Yes! Go to Customers, search for them, see their purchase history.

### Q: What if I discover we have too much stock of an item?

**A:** Go to Inventory, you can see how slow it's selling. You might lower the price to boost sales, or note it on your coupon flyer.

### Q: How do I handle items that expire (like paint)?

**A:** When adding stock in Purchases, you can note the expiry date. System can track it.

### Q: What if a customer pays partly cash and partly credit?

**A:** In POS, select "Mixed" payment type, enter cash amount and credit amount. System tracks both.

### Q: Can I see how much profit I made?

**A:** Yes. Reports > Financial Summary shows Revenue - Expenses = Profit.

### Q: What if I need to handle a refund?

**A:** You can create a negative sale (return) in POS - reverse the transaction, re-stock the items, refund the customer.

### Q: How do I back up my data?

**A:** The system automatically backs up regularly. Contact your technical support for regular backup verification.

---

## 📱 Using the System on Mobile

While the main interface is on computer, the system is designed to be responsive:

- If your computer monitor is tilted/rotated, you can use that
- Some operations (like checking customer info) work on tablets
- Full POS works best on regular computer with mouse

---

## ✨ Tips for Best Results

### 1. **Keep Data Clean**

- When adding products, be consistent with names
- "Paint" vs "paint" are different - use one style
- Enter phone numbers in same format

### 2. **Regular Updates**

- Keep product information current
- Update customer info when they provide new numbers
- Update supplier details when they change

### 3. **End of Day**

- Always process daily close
- Check cash vs system numbers match
- Note any discrepancies

### 4. **Regular Backups**

- Make sure backups are running
- Test recovery occasionally
- Have a plan if computer fails

### 5. **Staff Training**

- Train all staff on their specific role
- Create a quick reference sheet for common tasks
- Have a superuser (manager) who can help

### 6. **Supplier Orders**

- Order in bulk to save money
- Track reorder points carefully
- Keep supplier contact info updated

---

## 🎓 Training Schedule Suggestion

### Week 1: Basics

- Day 1: System overview, login, dashboard
- Day 2-3: POS - real sales transactions
- Day 4: Inventory - stock management
- Day 5: Customers - looking up and adding customers

### Week 2: Advanced

- Day 1: Suppliers and Purchases
- Day 2: Reports - understanding sales data
- Day 3: Settings and configuration
- Day 4: Staff management (for managers/owners)
- Day 5: Review and Q&A

### Ongoing

- Monthly: Financial review
- Quarterly: Inventory audit
- Annually: System review and updates

---

## 🤝 Getting Help

### For Normal Questions

- Ask your manager or owner
- They've been trained thoroughly
- Most issues have simple solutions

### For Technical Issues

- Email or call technical support
- Describe what you were doing when it happened
- What error message do you see?
- Do you have a screenshot?

### For New Feature Ideas

- Talk to the owner
- They can decide if it makes sense
- Sometimes simple solutions exist within current system

---

## 🎉 Conclusion

This system is designed to make your hardware shop business run more smoothly:

✅ **Faster** - Ring up sales in seconds, not minutes  
✅ **Accurate** - Math is always correct, taxes automatic  
✅ **Organized** - Everything recorded, easy to find  
✅ **Insightful** - See how your business is really doing  
✅ **Secure** - Data protected, access controlled  
✅ **Professional** - Customers get proper invoices and receipts

**Remember:** The system is a tool to help you. It doesn't make decisions - you do. It just makes your decisions faster and more accurate.

Good luck with your hardware shop! 🏗️

---

## 📞 Quick Reference

| Need to...                 | Go to...                         |
| -------------------------- | -------------------------------- |
| Ring up a sale             | POS                              |
| Check what we have         | Inventory                        |
| Add a new product          | Inventory → Add Item             |
| Find a customer            | Customers                        |
| Record a supplier delivery | Purchases                        |
| See how we're doing        | Reports / Dashboard              |
| Track business spending    | Expenses                         |
| Manage staff accounts      | Users                            |
| Change shop details        | Settings                         |
| Print a receipt            | POS → Print                      |
| Print a barcode label      | Inventory → Item → Print Barcode |
| See who owes us money      | Customers → Credit Summary       |

---

**Document Version: 1.0**  
**Last Updated: February 10, 2026**  
**Created for: Hardware Shop Staff and Management**
