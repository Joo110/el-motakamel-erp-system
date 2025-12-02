import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import Cookies from "js-cookie";



// ملفات الترجمة
const resources = {
  en: {

    translation: {
        
      // Header & General
      search: "Search",
      logout: "Logout",

      // Main Sections
      user_management: "User Management",
      products_management: "Products Management",
      inventory_management: "Inventory Management",
      purchases_management: "Purchases",
      sales_management: "Sales",
      hr_management: "HR Management",
      accounts_management: "Accounts Management",
      delegates_management: "Delegates Management",
position: "Position",
      // Products Section
      products: "Products",
      add_product: "Add Product",
      products_search: "Products Search",
      search_placeholder: "Search products by name, code, or description...",
      category: "Category",
      all_categories: "All Categories",
      reset: "Reset",
      confirm_delete_product: "Are you sure you want to delete this product?",
      loading_products: "Loading products...",
      failed_load_products: "Failed to load products",
      retry: "Retry",
      no_products_found: "No products found.",
      product: "Product",
      code: "Code",
      units: "Units",
      price: "Price",
      tax: "Tax",
      total: "Total",
      actions: "Actions",
      edit_product: "Edit Product",
      delete_product: "Delete Product",
      showing: "Showing",
      of: "of",
      show: "Show",
      entries: "entries",
      previous: "Previous",
      next: "Next",
Residual: "Residual",






    title: "Accounting",
    breadcrumb: "Dashboard > Accounting > Journals",
    statistics: "Dashboard › Production › Statistics",


    inventory: "inventory",
    addAccount: "Add Account",
    add: "Add",
    type: "Type",
    deleteConfirm: "Are you sure you want to delete this account?",
    deleteButton: "Delete account",
    loading: "Loading accounts...",

    name: "Name",
    namePlaceholder: "e.g. expenses",
    codePlaceholder: "e.g. 59000",
    cancel: "Cancel",
    save: "Add Account",



    

    revenue: "Revenue",
    expenses: "Expanses",
    profit: "Profit",
    bank: "Bank",
    receivable: "Accounts Receivable",
    payable: "Accounts Payable",
    netGrossProfit: "Net & Gross Profit",
    monthlyProfit: "Monthly Profit",
    netProfit: "Net profit",
    grossProfit: "Gross profit",
    sr: "SR",







      
      // Inventory Section
      inventories: "Inventories",
      add_inventory: "Add Inventory",
      stock_search: "Stock Search",
      transfer_management: "Transfer Management",
      transfer: "Transfer",
      Name: "Name",
      // Purchases Section
      request_order: "Request Order",
      precious_orders: "Precious Orders",
      purchase_invoice: "Purchase Invoice",
      suppliers: "Suppliers",
      supplier_list: "Supplier List",
      add_supplier: "Add Supplier",

      // Sales Section
      create_quotation: "Create Quotation",
      sales_orders: "Sales Orders",
      customer: "Customer",
      customer_list: "Customer List",
      add_customer: "Add Customer",

      // HR Section
      employees: "Employees",
      add_employee: "Add Employee",
      payroll: "Payroll",
      attendance: "Attendance",

      // Accounts Section
      accounts: "Accounts",
      accounting_tree: "Accounting Tree",
      journals: "Journals",
      new_journal: "New Journal",
      new_journal_entry: "New Journal Entry",
      journal_entries_viewer: "Journal Entries Viewer",
      // Delegates/Trips Section
      delegates: "Delegates",
      create_trip: "Create Trip",
      cars_list_view: "Cars List View",
      add_car: "Add Car",
      transfer_car: "Transfer",

      // Footer
      settings: "Settings",
      privacy_policy: "Privacy Policy",
      terms_conditions: "Terms & Conditions",
      akhdar_platform: "Akhdar Platform",
Precious: "Precious",
      // -------------------------
      // ⭐ Dashboard Home Texts ⭐
      // -------------------------
      dashboard_overview: "Dashboard Overview",
      dashboard_welcome: "Welcome back! Here's what's happening with your store today.",
Save_order: "Save_order",    
compelete: "compelete",
      total_revenue: "Total Revenue",
      total_users: "Total Users",
      total_products: "Total Products",
      monthly_sales: "Monthly Sales",

      recent_activity: "Recent Activity",
      view_all: "View All",

      quick_insights: "Quick Insights",
      conversion_rate: "Conversion Rate",
      avg_order_value: "Avg. Order Value",
      active_sessions: "Active Sessions",

      new_order_received: "New order received",
      product_stock_updated: "Product stock updated",
      new_user_registered: "New user registered",
      payment_received: "Payment received",

      // Edit Product Page
      products_management_title: "Products Management",
      dashboard: "Dashboard",
      edit_product_title: "Edit Product",

      product_name: "Product Name",
      description: "Description",
      edit_image: "Edit Image",
      upload: "Upload",
      save_product: "Save Product",
      saving: "Saving...",
      loading_product: "Loading product...",

      missing_product_id: "Product ID missing. Cannot save.",
      invalid_price: "Please enter a valid price (numbers only).",
      negative_price: "Price cannot be negative.",
      invalid_tax: "Invalid tax value.",
      product_updated: "Product updated successfully!",
      update_error: "Error updating product. Check console.",

      // PreciousManagement
    purchase_orders_management: "Purchase Orders Management",
    draft: "Draft",
    approved: "Approved",
    delivered: "Delivered",
    showing_orders: "Showing",
    of_orders: "of",
    orders: "orders",
    invoice_number_col: "Invoice Number",
    currency: "Currency",
    total_amount: "Total Amount",
    created_by: "Created By",
    created_at: "Created At",
    failed_to_load_orders: "Failed to load orders:",
    no_orders_found: "No orders found for this status.",
    approve: "Approve",
    deliver: "Deliver",
    invoice_btn: "Invoice",
    order_approved_successfully: "✅ Order approved successfully!",
    order_delivered_successfully: "🚚 Order delivered successfully!",
    failed: "❌ Failed:",
Dashboard: "Dashboard",

    

    // SupplierDetails
    supplier_details: "Precious Management",
    details: "Details",
    delete_supplier: "Delete Supplier",
    unnamed_supplier: "Unnamed Supplier",
    id: "Id:",
    location: "Location:",
    phone: "Phone:",
    email: "Email:",
    orders_section: "Orders",
    showing_orders_of: "Showing 1–",
    orders_text: "Orders",
    inventory_col_detail: "Inventory",
    total_price: "Total Price",
    order_time: "Order Time",
    status: "Status",
    loading_supplier_details: "Loading supplier details...",
    are_you_sure_delete: "Are you sure you want to delete this supplier?",

    // SupplierEditFilled
    edit_details: "Edit Details",
    supplier_name: "Supplier Name",
    address: "Address",
    save_details: "Save Details",
    please_enter_supplier_name: "Please enter supplier name.",
    please_enter_address: "Please enter address.",
    please_enter_email: "Please enter email.",
    invalid_email_format: "Invalid email format.",
    please_enter_phone: "Please enter phone number.",
    invalid_phone_number: "Invalid phone number. Only digits allowed (6-15 characters).",
    supplier_updated_successfully: "Supplier updated successfully!",
    failed_to_update_supplier: "Failed to update supplier. Check console for details.",

    // SupplierSearchList
    supplier_management: "Supplier Management",
    supplier_search: "Supplier Search",
    search_suppliers_placeholder: "Search suppliers by name, phone, or email...",
    loading_suppliers_text: "Loading suppliers...",
    no_suppliers_found: "No suppliers found.",
    are_you_sure_delete_supplier: "Are you sure you want to delete this supplier?",
    supplier_deleted: "✅ Supplier deleted successfully",
    unexpected_delete_response: "Supplier may not have been deleted. Check console for details.",
    delete_failed: "Delete failed. Check console.",
    add_inventory_title: "Add Inventory",
    capacity: "Capacity",
    save_inventory: "Save Inventory",
    inventory_name: "Inventory Name",
    upload_image: "Upload Image",
sale_type: "sale type",

    status_draft: "Draft",
      status_shipping: "Shipping",
      status_delivered: "Invoice",
      loading_transfer_data: "Loading transfer data...",
      transfer_not_found: "Transfer not found",
      back_to_management: "Back to Management",
      source_warehouse: "Source Warehouse",
      destination_warehouse: "Destination Warehouse",
      name_label: "Name:",
  Sectoral: "Sectoral",
  Sentence: "sentence",

      hr: "HR",
      personal_details: "Personal Details",
      employee_name: "Employee Name",
      job_title: "Job Title",
      national_id: "National Id",
      image_preview: "Image preview",
employeesSearch: "Employees Search",
      remove: "Remove",
      date_of_birth: "Date of Birth",
  
      alternate_phone: "Alternate Phone",
      job_details: "Job Details",
      department: "Department",
      work_location: "Work Location",
      role: "Role",
      manager: "Manager",
      level_of_experience: "Level of Experience",
      junior: "Junior",
      mid_level: "Mid-Level",
      senior: "Senior",
      director: "Director",
      employment_type: "Employment Type",
      full_time: "Full Time",
      part_time: "Part Time",
      project_based: "Project Based",
      salary: "Salary",
      date_of_employment: "Date of Employment",
  
      
      // Validation Messages
      validation_name_required: "Name is required",
      validation_job_title_required: "Job Title is required",
      validation_national_id_required: "National ID is required",
      validation_national_id_invalid: "National ID must be numeric and at least 6 digits",
      validation_email_required: "Email is required",
      validation_email_invalid: "Invalid email address",
      validation_department_required: "Please select a Department",
      validation_role_required: "Please select a Role",
      validation_manager_required: "Please select a Manager",
      validation_dob_required: "Please select Date of Birth",
      validation_doe_required: "Please select Date of Employment",
      validation_phone_numeric: "Phone must contain numbers only",
      validation_alt_phone_numeric: "Alternate Phone must contain numbers only",
      validation_salary_numeric: "Salary must be a number",
      validation_date_mismatch: "Employment date cannot be before birth date",
      validation_image_too_large: "❌ Image file is too large! Please upload an image under 3MB.",
      residual: "residual",
      // Success/Error Messages
      success_employee_created: "Employee created successfully",
      error_email_duplicate: "❌ This email is already registered!",
      error_phone_duplicate: "❌ This phone number is already registered!",
      error_alt_phone_duplicate: "❌ This alternative phone is already registered!",
      error_duplicate_field: "❌ Duplicate field value detected.",
      error_creating_employee: "Error creating employee",
precious_management: "precious_management",
    // SupplierAdd
    supplier_added_successfully: "Supplier added successfully!",
    failed_to_add_supplier: "Failed to add supplier.",
      // NewProduct / EditProduct / Form specific keys
      new_product: "New Product",
      products_management_header: "Products Management",
      breadcrumb_dashboard: "Dashboard",
      breadcrumb_products: "Products",
      new_product_title: "New Product",
      product_name_label: "Product Name",
      category_label: "Category",
      description_label: "Description",
      code_label: "Code",
      price_label: "Price",
      tax_label: "Tax",
      unit_label: "Unit",
      total_label: "Total",
      enter_product_code_placeholder: "Enter product code...",
      category_placeholder: "Category...",
      select_valid_category: "Please select a valid category!",
      image_too_large: "❌ Image file is too large! Please upload an image under 3MB.",
      product_created_success: "✅ Product created successfully!",
      duplicate_code_error: "❌ This product code is already in use!",
      error_creating_product: "Error creating product.",
      product_details: "Product Details",
      back_to_products: "Back to Products",
      product_image: "Product Image",
      view_product: "View Product",
addEmployee: "Add Employee",
      stock_in: "Stock in",
      invoice: "Invoice",
      order_number: "Order Number",
      order_date: "Order Date",
      supplier: "Supplier",
      supplier_id: "Supplier ID",
      invoice_id: "Invoice ID",
      payment_status: "Payment Status",
      organization_order: "Organization / Order",
      organization_id: "Organization ID",
      purchase_order_id: "Purchase Order ID",
      last_updated: "Last Updated",
      requested_products: "Requested Products",
      inventory_column: "Inventory",
status_label: "Status",
all_status: "All Statuses",
department_label: "Department",
monthly_view: "Monthly View",
    special_day_button: "Special Day",
    add_attendance_button: "Add Attendance",
      daily_view: "Daily View",

     employeesTitle: "employeesTitle",

                  all_Departments: "all_Departments",
search_Placeholder: "search_Placeholder",
showing_Employees: "showing_Employees",

      stock_out_draft: "Stock-Out Draft",
      loading_sales_order_details: "⏳ Loading sales order details...",
      failed_load_sales_order: "❌ Failed to load sales order",
      no_sales_order_data_found: "⚠️ No sales order data found for ID",
      invoice_already_exists_opening: "Invoice already exists — opening now",

      // Labels (General)
      time_date: "Time & Date",
      "Trans. number": "Trans. number",
      customer_id: "Customer ID",
      phone_number: "Phone Number",
      email_label: "Email",
      requested_by: "Requested By",
      address_label: "Address",
      reference_label: "Reference",
      
      // Attendance Day Screen
      attendance_management: "Attendance Management",
      select_date: "Select Date",
      date_label: "Date",
      day_placeholder: "Day (01-31)",
      search_label: "Search",
      loading_text: "Loading...",
      search_button: "Search",
      reset_button: "Reset",
      attendance_records: "Attendance Records",
      day_prefix: "- Day",
      showing_prefix: "Showing",
      of_suffix: "of",
      records_suffix: "records",
      show_prefix: "Show",
      entries_suffix: "entries",
      previous_button: "Previous",
      next_button: "Next",
      employee_column: "Employee",
      id_column: "ID",
      check_in_column: "Check In",
      check_out_column: "Check Out",
      duration_column: "Duration",
      status_column: "Status",
      notes_column: "Notes",
      unknown_text: "Unknown",
      loading_records_message: "Loading attendance records...",
      failed_load_records_message: "Failed to load attendance records.",
      no_records_for_date_message: "No attendance records found for this date.",
      select_date_to_view_message: "Please select a date to view attendance.",
      no_records_found_table: "No attendance records found.",
      table_header_name: "Name",
      table_header_check_in: "Check In",
      table_header_check_out: "Check Out",
      table_header_status: "Status",
      table_header_actions: "Actions",
      // Attendance Statuses
      status_present: "Present",
      status_absent: "Absent",
      status_late: "Late",
 Accounting: "Accounting",
 Journals:"Journals",
Showing: "Showing",
Accounts: "Accounts",
      placeholder: "Search employees by name, id, or department...",
      searchButton: "Search",
      resetButton: "Reset",
      monthLabel: "Month",
      statusLabel: "Status",
      departmentLabel: "Department",
 
   
        overtime: "Overtime",
        bonus: "Bonus",
        deductions: "Deductions",
        date: "Date",
  
      payButton: "Pay",
      modifyButton: "Modify",
   Previous:"Previous",
Next: "Next",
Show: "Show",
Add_Account: "Add_Account",
accounting: "accounting",
NewTrip: "New Trip",
   Location: "Location",
SaveTrip: "Save Trip",

        hoursLabel: "Over time",
        amountPlaceholder: "395",
        saveButton: "Save",

        amountLabel: "Amount",
        purposeLabel: "Purpose",

        baseSalaryLabel: "Base Salary",
        totalLabel: "Total",
   inventory_search: "inventory search:",

      sales: "Sales",
      notes: "Notes",
      payment: "Payment",
      shipping: "Shipping",
      total_payment: "Total Payment",
      reported_by: "Reported By",
      approved_by: "Approved By",
      received_by: "Received By",
      print: "Print",
      download_pdf: "Download PDF",
      loading_invoice: "Loading invoice...",
       transferred_products: "Transferred Products",
          from_label: "From",
          to_label: "To",
          no_products_transferred: "No products transferred yet",
          transfer_id_missing: "Transfer ID is missing",
          failed_load_transfer: "Failed to load transfer data",
          actions_col: "Actions",
          transfer_from: "Transfer From",
          expected_delivery_date: "Expected Delivery Date",
  Customer_Search: "Customer Search",
          order_products: "Order Products",
          update_order: "Update Order",
          select_supplier: "Select supplier",
          select_product: "Select",
          select_inventory: "Select inventory",


          
          
      // --- additional English keys (from your JSON) ---
      "unknown_product": "Unknown Product",
      "n_a": "N/A",
      "currency_sr": "SAR",
      "failed_load_stocks": "Failed to load stocks",
      "unnamed_inventory": "Unnamed Inventory",
      "location_label": "Location:",
      "capacity_label": "Capacity:",
      "edit_details_btn": "Edit Details",
      "delete_btn": "Delete",
      "id_label": "ID:",
      "inventory_products": "Inventory Products",
      "manage_stocks": "Manage Stocks",
      "edit_label": "Edit",
      "show_label": "Show",
      "entries_label": "Entries",
      "previous_label": "Previous",
      "next_label": "Next",
      "edit_quantity_label": "Quantity",
      "edit_price_label": "Price",
      "cancel_label": "Cancel",
      "save_label": "Save",
      "saving_label": "Saving...",
      "loading_inventory_details": "Loading inventory details...",
      "confirm_delete_inventory": "Are you sure you want to delete this inventory?",
      "failed_delete_inventory": "Failed to delete inventory",
      "cannot_determine_stock_id": "Cannot determine stock ID",
      "failed_update_stock": "Failed to update stock",
      "failed_delete_stock": "Failed to delete stock",

"hrManagement": "HR Management",
 


    "personalDetails": "Personal Details",
    "jobDetails": "Job Details",
  


    "jobTitle": "Job Title",
    "nationalId": "National ID",
    "dateOfBirth": "Date of Birth",
  
    "alternatePhone": "Alternate Phone",
    "workLocation": "Work Location",
    "level": "Level of Experience",
    "employmentType": "Employment Type",
    "dateOfEmployment": "Date of Employment",



    "imagePreview": "Image preview",
    "uploadImage": "Upload Image",
    "editImage": "Edit Image",
    "mmddyyyy": "mm/dd/yyyy",
    "saveDetails": "Save Details",
  

  "sales_order": "Sales Order",
  "action": "Action",
  "view": "View",
  "failed_to_load": "Failed to load",
  "order_approved": "✅ Order approved successfully!",
  "order_delivered": "🚚 Order marked as delivered!",
  "action_failed": "❌ Action failed",
  "loading_user": "Loading user...",

      "order_id_missing": "Order ID is missing",
      "please_fill_shipping_fees": "Please enter shipping fees",
      "shipping_fees_must_number": "Shipping fees must be a number",
      "shipping_cost_updated": "Shipping cost updated successfully",
      "shipping_label": "Shipping",
      "shipping_cost": "Shipping Cost",
      "order_number_label": "Order Number:",
      "shipping_fees_label": "Shipping Fees",
      "operation_date_label": "Operation Date",
      "save_transfer_label": "Save Transfer",

      "supplier_label": "Supplier",
 
      "currency_label": "Currency",
      "add_products": "Add Products",
      "product_label": "Product",
      "inventory_label": "Inventory",
      "units_label": "Units",
      "discount_label": "Discount",
      "reset_btn": "Reset",
      "add_product_btn": "+ Add Product",
      "received_products": "Received Products",
      "product_col": "Product",
      "inventory_col": "Inventory",
      "code_col": "Code",
      "units_col": "Units",
      "price_col": "Price",
      "discount_col": "Discount",
      "total_col": "Total",
      "notes_label": "Notes",
      "add_notes_placeholder": "Add any notes here...",
      "save_order_btn": "Save Order",
      "loading_suppliers": "Loading suppliers...",
      "loading_inventories": "Loading inventories...",
      "please_select_product": "Please select a product",
      "please_select_inventory": "Please select an inventory",
      "units_must_greater_zero": "Units must be greater than 0",
      "price_must_greater_zero": "Price must be greater than 0",
      "please_select_supplier_before_saving": "Please select a supplier before saving",
      "please_add_at_least_one_product": "Please add at least one product",
      "order_saved_successfully": "Order saved successfully",
      "failed_save_order_check_console": "Failed to save order. Check console for details",

  "breadcrumb_production": "Production",
  "breadcrumb_statistics": "Statistics",
  "breadcrumb_journals": "Dashboard > Accounting > Journals",

  "showing_inventory": "Showing {{start}}-{{end}} of {{total}} inventory",

  "add_account": "Add Account",
  "delete_confirm": "Are you sure you want to delete this account?",

  "loading_accounts": "Loading accounts...",
  "placeholder_expenses": "e.g. expenses",
  "placeholder_code": "e.g. 59000",


  "accounts_receivable": "Accounts Receivable",
  "accounts_payable": "Accounts Payable",
  "net_gross_profit": "Net & Gross Profit",
  "net_profit": "Net profit",
  "gross_profit": "Gross profit",
  "monthly_profit": "Monthly Profit",

  "Production": "Production",
  "Statistics": "Statistics",
  "Revenue": "Revenue",
  "Expanses": "Expenses",
  "Profit": "Profit",
  "Bank": "Bank",
  "Accounts Receivable": "Accounts Receivable",
  "Accounts Payable": "Accounts Payable",
  "Net & Gross Profit": "Net & Gross Profit",
  "Net profit": "Net profit",
  "Gross profit": "Gross profit",
  "Monthly Profit": "Monthly Profit",
  "Loading...": "Loading...",






  "SR": "SR",

  "Journal Entries": "Journal Entries",
  "Select Journal": "Select Journal",
  "Select a journal...": "Select a journal...",
  "Account": "Account",
  "Description": "Description",
  "Debit (SR)": "Debit (SR)",
  "Credit (SR)": "Credit (SR)",
  "Select account...": "Select account...",
  "Enter description...": "Enter description...",
  "Total Debit": "Total Debit",
  "Total Credit": "Total Credit",
  "Cancel": "Cancel",
  "Saving...": "Saving...",
  "Save Entry": "Save Entry",
  "Please select a journal!": "Please select a journal!",
  "Please fill all line details!": "Please fill all line details!",
  "Entry is not balanced! Debit must equal Credit.": "Entry is not balanced! Debit must equal Credit.",
  "Journal entry created successfully!": "Journal entry created successfully!",
  "Error creating journal entry. Please try again.": "Error creating journal entry. Please try again.",
  "Error fetching journals or accounts.": "Error fetching journals or accounts.",
"Select Agent..." : "Select Agent...",
"Enter Location...": "Enter Location...",
"Enter driver name...": "Enter driver name...",
"Select Car...": "Select Car...",
"Select Area..." : "Select Area...",





  
// Modal / Modify salary

"modify_salary": "Modify Salary",
"hours_label": "Over time hours",
"amount_placeholder": "Amount",

"amount_label": "Amount",
"purpose_label": "Purpose",

"base_salary": "Base Salary",

"added_success": "Saved successfully",



// Months (optional - helpful if you want to translate month names)
"January": "January",
"February": "February",
"March": "March",
"April": "April",
"May": "May",
"June": "June",
"July": "July",
"August": "August",
"September": "September",
"October": "October",
"November": "November",
"December": "December",




// Status
"all": "All",
"paid": "Paid",
"unpaid": "Unpaid",




 "Delegates": "Delegates",
  "Delegates Management": "Delegates Management",
  "Trip": "Trip",
  "Expenses": "Expenses",
  "End Time": "End Time",
  "New Order": "New Order",
  "Orders": "Orders",
  "Showing 1-10 of 47 products": "Showing 1-10 of 47 products",
  "Order number": "Order number",
  "Customer": "Customer",
  "Total Price": "Total Price",
  "Order Time": "Order Time",
  "Action": "Action",
  "Invoice": "Invoice",
  "Inventory": "Inventory",
  "Stock out": "Stock out",
  "Sales Management": "Sales Management",
  "Invoice number:": "Invoice number:",
  "Created by": "Created by",
  "Order Date": "Order Date",
  "Select customer...": "Select customer...",
  "Add Products": "Add Products",
  "Product": "Product",
  "Code": "Code",
  "Units": "Units",
  "Price": "Price",
  "Discount": "Discount",
  "Total": "Total",
  "Add Product": "Add Product",
  "Received Products": "Received Products",
  "Notes": "Notes",
  "Add notes here...": "Add notes here...",


  "Trips Management": "Trips Management",
  "Dashboard > Delegates": "Dashboard > Delegates",
  "Trips": "Trips",
  "Showing 1-10 of {totalTrips} Trips": "Showing 1-10 of {totalTrips} Trips",
  "Trip number": "Trip number",
  "Agent": "Agent",
  "Driver": "Driver",
  "Sales": "Sales",
  "Area": "Area",
  "Date": "Date",
  "Status": "Status",
  "Continue": "Continue",






"Accounting Management": "Accounting Management",
  "Add Journal": "Add Journal",
  "Search by name, type, or code...": "Search by name, type, or code...",
  "Search": "Search",
  "Type": "Type",
  "Created": "Created",
  "Actions": "Actions",
  "N/A": "N/A",
  "No journals found": "No journals found",
  "Prev": "Prev",
  "Are you sure you want to delete \"{name}\"?": "Are you sure you want to delete \"{name}\"?",
  "Journal deleted successfully!": "Journal deleted successfully!",
  "Failed to delete journal": "Failed to delete journal",



"Journal Management": "Journal Management",
  "New Journal": "New Journal",
  "Create New Journal": "Create New Journal",
  "إنشاء دفتر يومية جديد": "إنشاء دفتر يومية جديد",
  "Journal Name": "Journal Name",
  "Enter journal name": "Enter journal name",
  "Journal Type": "Journal Type",
  "-- Select Journal Type --": "-- Select Journal Type --",
  "➕ Add new type...": "➕ Add new type...",
  "Write new journal type...": "Write new journal type...",
  "Journal Code": "Journal Code",
  "Enter unique journal code": "Enter unique journal code",
  "About Journals": "About Journals",
  "Journals are used to record financial transactions.": "Journals are used to record financial transactions.",
  "Save Journal": "Save Journal",
  "❌ Please enter journal name!": "❌ Please enter journal name!",
  "❌ Please enter journal code!": "❌ Please enter journal code!",
  "❌ Please enter or select journal type!": "❌ Please enter or select journal type!",
  "❌ This journal code is already in use!": "❌ This journal code is already in use!",
  "✅ Journal created successfully!": "✅ Journal created successfully!",
  "❌ Error creating journal. Please try again.": "❌ Error creating journal. Please try again.",



// Departments
"all_departments": "All Departments",
"technical_support": "Technical Support",
"software": "Software",

      "precious": "Precious",
  "invoices": "Invoices",
  "management_precious": "Precious Management",
  "partial": "Partial",
  "showing_invoices": "Showing invoices {start}-{end} of {total}",
  "invoices_text": "Invoices",


  "total_due": "Total Due",
  "remaining": "Remaining",
  "last_payment": "Last Payment",
 
  "pay": "Pay",
      "purchase_order": "Purchase Order",
      "invoice_number": "Invoice Number",
      "invoice_date": "Invoice Date",
      "company_info": "Company Information",
      "warehouse_id": "Warehouse ID",
      "quantity_label": "Quantity",
      "subtotal_label": "Subtotal",
      "tax_14": "Tax (14%)",
      "back_btn": "Back",
      "edit_btn": "Edit",
      "create_invoice_btn": "Create Invoice",
      "creating_label": "Creating...",
      "export_btn": "Export",
      "unexpected_server_response": "Unexpected server response — please contact admin",
      "server_returned_welcome_erp": "Server returned \"Welcome to ERP\" — request reached the wrong endpoint (dev server)",
      "invoice_created_successfully": "Invoice created successfully!",
      "failed_create_invoice": "Failed to create invoice",
      "loading_purchase_order_details": "⏳ Loading purchase order details...",
      "failed_load_purchase_order": "❌ Failed to load purchase order",
      "no_purchase_order_data_found": "⚠️ No purchase order data found for ID",
      "error_label": "Error",
      "stock_in_draft": "Stock-In Draft",


      "breadcrumb_attendance": "Dashboard > Attendance",
      "employees_search": "Employees Search",
      "add_new_attendance": "Add New Attendance",
      
      // Buttons
      "daily": "Daily",
      "monthly": "Monthly",

      "special_day": "special day",
      "check_in": "Check In",
      "check_out": "Check Out",
      "add_attendance": "Add Attendance",

      // Inputs / Labels
   
      "present": "Present",
      "absent": "Absent",
      "late": "Late",
      "showing_entries": "Showing {{start}}-{{end}} of {{total}} employees",
      "show_entries": "Show {{count}} entries",


      "status_P": "P",
      "status_A": "A",

      "customer_label": "Customer",
      "loading_customers": "Loading customers...",
      "select_customer": "Select Customer",
      "select_pro": "Select Product",
      "select_inv": "Select Inventory",
      "no_products_added_yet": "No products added yet",
      "please_select_customer_before_saving": "Please select a customer before saving",
      "invalid_product_fields_check_console": "One or more product fields missing (productId/inventoryId/quantity). Check console",
      "shipping_cost_must_valid_number": "Shipping cost must be a valid non-negative number",
      "sale_order_saved_successfully": "Sale order saved successfully",
      "failed_save_sale_order_check_console": "Failed to save sale order. Check console for details",
      "stock_out": "Stock Out",
      "transactions": "Transactions",





      "Transfer_Management": "Transfer Management",
        "Transfer": "Transfer",
        "car": "car",
        "Transfer_from": "Transfer from",
        "Loading_inventory": "Loading inventory...",
        "Select_inventory": "Select inventory",
        "select_from_first": "Select \"From\" inventory first",
        "Loading_products": "Loading products...",
        "Select_product": "Select product",
        "available": "available",
        "To": "To",
        "Loading_car": "Loading car...",
        "Select_car": "Select car",
        "Reference": "Reference",
        "Enter_reference_number": "Enter reference number",
        "Shipping_Cost": "Shipping Cost",
   
        "Reset": "Reset",
        "Transferring": "Transferring...",
        "Transferred_Products": "Transferred Products",
        "From": "From",
        "no_transferred_products_yet": "No transferred products yet",
"totalTrips": "totalTrips",



        "Saving": "Saving...",
        "Save_Transfer": "Save Transfer",
        "select_transfer_from_first": "Please select \"Transfer from\" inventory first.",
        "select_product_transfer": "Please select a product to transfer.",
        "select_to_inventory": "Please select \"To\" inventory.",
        "source_dest_different": "Source and destination inventories must be different.",
        "units_greater_zero": "Units must be greater than 0.",
        "price_zero_greater": "Price must be 0 or greater.",
        "select_from_before_saving": "Please select \"Transfer from\" before saving.",
        "select_to_before_saving": "Please select \"To\" before saving.",
        "no_products_to_save": "No transferred products to save.",
        "invalid_product_rows": "None of the table rows contain valid productId — please add products from the product dropdown.",
        "quantity_exceeds_available": "❌ Requested quantity ({{requested}}) exceeds available ({{available}}) for product {{name}}",
        "transfer_created_success": "✅ Stock transfer created successfully",
        "failed_save_transfer": "Failed to save transfer. See console for details. server status:",

   
  "searchPlaceholder": "Search employees by name, id, or department...",
 
  "modify": "Modify",
  "modifySalary": "Modify Salary",
  "hoursPlaceholder": "2 hours",
  "amount": "Amount",
  "purpose": "Purpose",
  "totalSalary": "Total Salary",
  "baseSalary": "Base Salary",
  "currencySR": "SR",
  "All": "All",
  "Paid": "Paid",
  "Unpaid": "Unpaid",
  "All Departments": "All Departments",
  "Technical Support": "Technical Support",
  "HR": "HR",
  "Software": "Software",



      "Cars": "Cars",
      "Cars_Management": "Cars Management",
      "Add_Car": "Add Car",
      "Car_Search": "Car Search",
      "search_car_placeholder": "Search Car by name, id, or location",

      "no_cars_found": "No cars found matching your search.",
      "Last_Updated": "Last Updated",
      "Unnamed_Car": "Unnamed Car",


      "label": "Choose Journal",
      "refresh": "Refresh",
      "selectedLabel": "Selected Journal",
      "codeLabel": "Code: {{code}}",
      "loadingEntries": "Loading journal entries...",
    
        "message": "Please select a journal from the dropdown above to view its entries.",
     
 
      "totalDebit": "Total Debit",
      "totalCredit": "Total Credit",
   
      "balanced": "✓ Balanced",
      "unbalanced": "✗ Unbalanced",

      "entryIdLabel": "Entry ID",
      "createdAtLabel": "Created At",
      "deleteButtonTitle": "Delete Entry",

        "index": "#",
        "account": "Account",
        "debit": "Debit (SR)",
        "credit": "Credit (SR)",
        "entryTotalLabel": "Entry Total:",
   
        "unknown": "Unknown Account",
     
      "entryDeleted": "✅ Entry deleted successfully",
      "entryDeleteError": "❌ Error deleting entry",
      "entriesRefreshed": "✅ Entries refreshed",
  
  
    "addJournal": "Add Journal",
      "button": "Search",
 
 
      "created": "Created",
      "noJournals": "No journals found",
 
      "delete": "Are you sure you want to delete \"{{name}}\"?",
    
      "deleted": "Journal deleted successfully!",
      "deleteFailed": "Failed to delete journal",
 
      "prev": "Prev",

  
    "pageTitle": "Journal Management",

    "titleArabicNote": "Create New Journal (Arabic note shown in UI)",

  
      "typePlaceholder": "-- Select Journal Type --",
      "typeAddOption": "➕ Add new type...",
      "typeCustomPlaceholder": "Write new journal type...",
 
      "heading": "About Journals",
      "body": "Journals are used to record financial transactions.",
  
    
      "missingName": "❌ Please enter journal name!",
      "missingCode": "❌ Please enter journal code!",
      "missingType": "❌ Please enter or select journal type!",
      "duplicateCode": "❌ This journal code is already in use!",
      "createError": "❌ Error creating journal. Please try again.",

    "selectJournalLabel": "Select Journal",
    "selectJournalPlaceholder": "Select a journal...",
    "selectAccountPlaceholder": "Select account...",

      "descriptionPlaceholder": "Enter description...",

 
      "selectJournal": "❌ Please select a journal!",
      "fillLines": "❌ Please fill all line details!",
      "notBalanced": "❌ Entry is not balanced! Debit must equal Credit.",
      "fetchError": "❌ Error fetching journals or accounts.",
      "createErrorGeneric": "Error creating journal entry. Please try again.",
    
      "balancedRequired": "Entry must be balanced and not zero.",




       "Journal Entries Viewer": "Journal Entries Viewer",

  "Refresh": "Refresh",
  "Choose Journal": "Choose Journal",
  "-- Select a Journal --": "-- Select a Journal --",
  "Selected Journal": "Selected Journal",
  "Code:": "Code:",
  "✓ Balanced": "✓ Balanced",
  "✗ Unbalanced": "✗ Unbalanced",
  "Loading journal entries...": "Loading journal entries...",
  "No Journal Selected": "No Journal Selected",
  "Please select a journal from the dropdown above to view its entries.": "Please select a journal from the dropdown above to view its entries.",
  "No Entries Found": "No Entries Found",
  "This journal doesn't have any entries yet.": "This journal doesn't have any entries yet.",
  "Entry ID": "Entry ID",
  "Created At": "Created At",
  "Delete Entry": "Delete Entry",
  "Entry Total:": "Entry Total:",
  "Grand Total": "Grand Total",
  "Debit": "Debit",
  "Credit": "Credit",
  "Unknown Account": "Unknown Account",
  "Are you sure you want to delete this entry?": "Are you sure you want to delete this entry?",
  "✅ Entry deleted successfully": "✅ Entry deleted successfully",
  "❌ Error deleting entry": "❌ Error deleting entry",
  "✅ Entries refreshed": "✅ Entries refreshed",
  "❌ Error refreshing entries": "❌ Error refreshing entries",


"cars": "Cars",
  "addCarTitle": "Add Car",
  "carManagement": "Car Management",
  "carName": "Car Name",
  "brand": "Brand",
  "year": "Year",
  "changeImage": "Change Image",
  "saveCar": "Save Car",
  "carNameRequired": "Car name is required",
  "brandRequired": "Brand is required",
  "yearRequired": "Year is required",
  "carAddedSuccess": "Car added successfully!",


  "editDetails": "Edit Details",
  "carItemsTitle": "Car Items",
  "tableItem": "Item",
  "tableCategory": "Category",
  "tableUnits": "Units",
  "tablePrice": "Price",
  "tableTotal": "Total",
  "loadingItems": "Loading items...",
  "noItemsFound": "No items found",
  "deleteItemConfirm": "Delete this item from the car?",
  "editCarItemTitle": "Edit Car Item",
  "labelItem": "Item",
  "labelQuantity": "Quantity",
  "labelPriceSR": "Price (SR)",




    }
    
  },
  ar: {
    translation: {
      // Header & General
      search: "بحث",
      logout: "تسجيل خروج",

      // Main Sections
      user_management: "إدارة المستخدمين",
      products_management: "إدارة المنتجات",
      inventory_management: "إدارة المخزون",
      purchases_management: "المشتريات",
      sales_management: "المبيعات",
      hr_management: "إدارة الموارد البشرية",
      accounts_management: "إدارة الحسابات",
      delegates_management: "إدارة المندوبين",


status_draft: "مسودة",
      status_shipping: "شحن",
      status_delivered: "فاتورة",
      loading_transfer_data: "جاري تحميل بيانات النقل...",
      transfer_not_found: "لم يتم العثور على عملية النقل",
      back_to_management: "العودة إلى الإدارة",
      source_warehouse: "المستودع المصدر",
      destination_warehouse: "المستودع الوجهة",
      name_label: "الاسم:",


      // Component Strings
      dashboard: "لوحة التحكم",
      hr: "الموارد البشرية",
      add: "إضافة",
      personal_details: "التفاصيل الشخصية",
      employee_name: "اسم الموظف",
      job_title: "المسمى الوظيفي",
      national_id: "الهوية الوطنية",
      image_preview: "معاينة الصورة",
      edit_image: "تعديل الصورة",
      upload_image: "رفع صورة",
      remove: "إزالة",
      address: "العنوان",
      date_of_birth: "تاريخ الميلاد",
      email: "البريد الإلكتروني",
      phone: "الهاتف",
      alternate_phone: "هاتف بديل",
      job_details: "تفاصيل الوظيفة",
      department: "القسم",
      work_location: "موقع العمل",
      role: "الدور/الصلاحية",
      manager: "المدير",
      level_of_experience: "مستوى الخبرة",
      junior: "مبتدئ",
      mid_level: "متوسط",
      senior: "خبير",
      director: "مدير تنفيذي",
      employment_type: "نوع التوظيف",
      full_time: "دوام كامل",
      part_time: "دوام جزئي",
      project_based: "على أساس مشروع",
      salary: "الراتب",
      date_of_employment: "تاريخ التوظيف",
      cancel: "إلغاء",
      save_details: "حفظ التفاصيل",
status_label: "الحالة",
all_status: "كل الحالات",
department_label: "القسم",
monthly_view: "عرض شهري",
Dashboard: "الرئيسية",
    special_day_button: "يوم خاص",
    add_attendance_button: "إضافة حضور",
      daily_view: "عرض يومي",
      // Validation Messages
      validation_name_required: "الاسم مطلوب",
      validation_job_title_required: "المسمى الوظيفي مطلوب",
      validation_national_id_required: "الهوية الوطنية مطلوبة",
      validation_national_id_invalid: "الهوية الوطنية يجب أن تكون أرقاماً و 6 خانات على الأقل",
      validation_email_required: "البريد الإلكتروني مطلوب",
      validation_email_invalid: "صيغة البريد الإلكتروني غير صحيحة",
      validation_department_required: "يرجى اختيار القسم",
      validation_role_required: "يرجى اختيار الدور/الصلاحية",
      validation_manager_required: "يرجى اختيار المدير",
      validation_dob_required: "يرجى اختيار تاريخ الميلاد",
      validation_doe_required: "يرجى اختيار تاريخ التوظيف",
      validation_phone_numeric: "الهاتف يجب أن يحتوي على أرقام فقط",
      validation_alt_phone_numeric: "الهاتف البديل يجب أن يحتوي على أرقام فقط",
      validation_salary_numeric: "الراتب يجب أن يكون رقماً",
      validation_date_mismatch: "تاريخ التوظيف لا يمكن أن يسبق تاريخ الميلاد",
      validation_image_too_large: "❌ ملف الصورة كبير جداً! يرجى تحميل صورة بحجم أقل من 3 ميجابايت.",

      // Success/Error Messages
      success_employee_created: "تم إنشاء الموظف بنجاح",
      error_email_duplicate: "❌ هذا البريد الإلكتروني مسجل بالفعل!",
      error_phone_duplicate: "❌ رقم الهاتف هذا مسجل بالفعل!",
      error_alt_phone_duplicate: "❌ رقم الهاتف البديل هذا مسجل بالفعل!",
      error_duplicate_field: "❌ تم اكتشاف قيمة حقل مكررة.",
      error_creating_employee: "خطأ في إنشاء الموظف",


      allDepartments: "allDepartments",
searchPlaceholder: "searchPlaceholder",
showingEmployees: "showingEmployees",

      // Products Section
      products: "المنتجات",
      add_product: "إضافة منتج",
      products_search: "بحث المنتجات",
      search_placeholder: "ابحث عن المنتجات بالاسم، الكود، أو الوصف...",
      category: "الفئة",
      all_categories: "كل الفئات",
      reset: "إعادة تعيين",
      confirm_delete_product: "هل أنت متأكد أنك تريد حذف هذا المنتج؟",
      loading_products: "جاري تحميل المنتجات...",
      failed_load_products: "فشل تحميل المنتجات",
      retry: "إعادة المحاولة",
      no_products_found: "لم يتم العثور على منتجات.",
      product: "المنتج",
      code: "الكود",
      units: "الوحدات",
      price: "السعر",
      tax: "الضريبة",
      total: "الإجمالي",
      Name: "الاسم",
      actions: "الإجراءات",
      edit_product: "تعديل المنتج",
      delete_product: "حذف المنتج",
      showing: "عرض",
      of: "من",
      show: "عرض",
      entries: "مدخلات",
      previous: "السابق",
      next: "التالي",


        // PreciousManagement
    purchase_orders_management: "إدارة طلبات الشراء",
    draft: "مسودة",
    approved: "مُعتمد",
    delivered: "مُسلم",
    showing_orders: "عرض",
    of_orders: "من",
    orders: "طلبات",
    invoice_number_col: "رقم الفاتورة",
    currency: "العملة",
    total_amount: "المبلغ الإجمالي",
    created_by: "تم الإنشاء بواسطة",
    created_at: "تاريخ الإنشاء",
    loading: "جاري التحميل...",
    failed_to_load_orders: "فشل تحميل الطلبات:",
    no_orders_found: "لم يتم العثور على طلبات لهذه الحالة.",
    approve: "اعتماد",
    deliver: "تسليم",
    invoice_btn: "فاتورة",
    order_approved_successfully: "✅ تم اعتماد الطلب بنجاح!",
    order_delivered_successfully: "🚚 تم تسليم الطلب بنجاح!",
    failed: "❌ فشل:",
precious_management: "أدارة الفاتورة",
NewTrip: "أضافه رحلة",
   Location: "عنوان",
SaveTrip: "حفظ",

      // Navigation & Breadcrumbs
      attendance: "الحضور والانصراف",

    
      stock_out_draft: "مسودة إخراج مخزون",
      loading_sales_order_details: "⏳ جاري تحميل تفاصيل طلب المبيعات...",
      failed_load_sales_order: "❌ فشل تحميل طلب المبيعات",
      no_sales_order_data_found: "⚠️ لم يتم العثور على بيانات طلب مبيعات للرقم التعريفي",
      invoice_already_exists_opening: "الفاتورة موجودة بالفعل - يتم فتحها الآن",
      residual: "الباقي",
      // Labels (General)
      type: "النوع",
      time_date: "الوقت والتاريخ",
      "Trans. number": "رقم المعاملة",
      customer_id: "الرقم التعريفي للعميل",
      phone_number: "رقم الهاتف",
      email_label: "البريد الإلكتروني",
      requested_by: "مطلوب بواسطة",
      address_label: "العنوان",
      reference_label: "المرجع",
      
      // Attendance Day Screen
      attendance_management: "إدارة الحضور والانصراف",
      select_date: "اختر التاريخ",
      date_label: "التاريخ",
      day_placeholder: "اليوم (01-31)",
      search_label: "بحث",
      loading_text: "جار التحميل...",
      search_button: "بحث",
      reset_button: "إعادة تعيين",
      attendance_records: "سجلات الحضور والانصراف",
      day_prefix: "- يوم",
      showing_prefix: "عرض",
      of_suffix: "من",
      records_suffix: "سجل",
      show_prefix: "عرض",
      entries_suffix: "مدخلات",
      previous_button: "السابق",
      next_button: "التالي",
      employee_column: "الموظف",
      id_column: "الرقم التعريفي",
      check_in_column: "وقت الحضور",
      check_out_column: "وقت الانصراف",
      duration_column: "المدة",
      status_column: "الحالة",
      notes_column: "ملاحظات",
      unknown_text: "غير معروف",
      loading_records_message: "جار تحميل سجلات الحضور والانصراف...",
      failed_load_records_message: "فشل تحميل سجلات الحضور والانصراف.",
      no_records_for_date_message: "لم يتم العثور على سجلات حضور لهذا التاريخ.",
      select_date_to_view_message: "الرجاء اختيار تاريخ لعرض الحضور.",
      no_records_found_table: "لم يتم العثور على سجلات حضور.",
      // Attendance Statuses
      status_present: "حاضر",
      status_absent: "غائب",
      status_late: "متأخر",
      Residual: "الباقي",
sale_type: "نوع البيع",

    title: "المحاسبة",
    breadcrumb: "لوحة التحكم > المحاسبة > اليوميات",
    statistics: "لوحة التحكم › الإنتاج › الإحصائيات",
  
 
    inventory: "حساب",
    addAccount: "إضافة حساب",
 
    deleteConfirm: "هل أنت متأكد من حذف هذا الحساب؟",
    deleteButton: "حذف الحساب",
 
    name: "الاسم",
    namePlaceholder: "مثال: المصروفات",
    codePlaceholder: "مثال: 59000",
    save: "إضافة حساب",
  

    revenue: "الإيرادات",
    expenses: "المصروفات",
    profit: "الأرباح",
    bank: "البنك",
    receivable: "الذمم المدينة",
    payable: "الذمم الدائنة",
    netGrossProfit: "صافي وإجمالي الربح",
    monthlyProfit: "الأرباح الشهرية",
    netProfit: "صافي الربح",
    grossProfit: "إجمالي الربح",
    sr: "ريال",
Accounting: "المحاسبة",
 Journals:"المجلات",
Show: "عرض",
Accounts: "محاسبة",
Previous:"رجوع",
Next: "بعد",
Showing: "عرض",
Add_Account: "أضافة",
accounting: "المحاسبة",
 Sectoral: "قطاعي",
  Sentence: "جملة",




    // SupplierDetails
    supplier_details: "إدارة الثمين",
    details: "التفاصيل",
    delete_supplier: "حذف المورد",
    unnamed_supplier: "مورد بدون اسم",
    id: "المعرف:",
    location: "الموقع:",
    orders_section: "الطلبات",
    showing_orders_of: "عرض 1–",
    orders_text: "طلبات",
    inventory_col_detail: "المخزن",
    total_price: "السعر الإجمالي",
    order_time: "وقت الطلب",
    status: "الحالة",
    loading_supplier_details: "جاري تحميل تفاصيل المورد...",
    are_you_sure_delete: "هل أنت متأكد من حذف هذا المورد؟",
table_header_name: "الاسم",
      table_header_check_in: "وقت الحضور",
      table_header_check_out: "وقت الانصراف",
      table_header_status: "الحالة",
      table_header_actions: "الإجراءات",
    // SupplierEditFilled
    edit_details: "تعديل التفاصيل",
    supplier_name: "اسم المورد",
    please_enter_supplier_name: "الرجاء إدخال اسم المورد.",
    please_enter_address: "الرجاء إدخال العنوان.",
    please_enter_email: "الرجاء إدخال البريد الإلكتروني.",
    invalid_email_format: "تنسيق البريد الإلكتروني غير صحيح.",
    please_enter_phone: "الرجاء إدخال رقم الهاتف.",
    invalid_phone_number: "رقم الهاتف غير صحيح. يُسمح بالأرقام فقط (6-15 حرفًا).",
    supplier_updated_successfully: "تم تحديث المورد بنجاح!",
    failed_to_update_supplier: "فشل تحديث المورد. تحقق من الكونسول للتفاصيل.",
addEmployee: "إضافة موظف",
    // SupplierSearchList
    supplier_management: "إدارة الموردين",
    supplier_search: "البحث عن الموردين",
    add_supplier: "إضافة مورد",
    search_suppliers_placeholder: "ابحث عن الموردين بالاسم أو الهاتف أو البريد الإلكتروني...",
    suppliers: "الموردين",
    loading_suppliers_text: "جاري تحميل الموردين...",
    no_suppliers_found: "لم يتم العثور على موردين.",
    are_you_sure_delete_supplier: "هل أنت متأكد من حذف هذا المورد؟",
    supplier_deleted: "✅ تم حذف المورد بنجاح",
    unexpected_delete_response: "قد لا يتم حذف المورد. تحقق من الكونسول للتفاصيل.",
    delete_failed: "فشل الحذف. تحقق من الكونسول.",
add_inventory_title: "إضافة مخزن",
Save_order: "اضافه اوردر",
compelete: "انتهي",
    // SupplierAdd
    add_supplier_title: "إضافة مورد",
    saving: "جاري الحفظ...",
    supplier_added_successfully: "تمت إضافة المورد بنجاح!",
    failed_to_add_supplier: "فشل إضافة المورد.",
sales: "المبيعات",
      notes: "الملاحظات",
      // Inventory Section
      inventories: "المخازن",
      add_inventory: "إضافة مخزن",
      stock_search: "البحث في المخزون",
      transfer_management: "إدارة التحويلات",
      transfer: "تحويل",
Customer_Search: "بحث العملاء",
      // Purchases Section
      request_order: "طلب شراء",
      precious_orders: "الطلبات الثمينة",
      purchase_invoice: "فاتورة شراء",
      supplier_list: "قائمة الموردين",



            all_Departments: "كل التخصصات",
search_Placeholder: "البحث عن العنصر",
showing_Employees: "عرض الموظفين",


    
        overtime: "العمل الإضافي",
        bonus: "المكافأة",
        deductions: "الخصومات",
        date: "التاريخ",
   
      payButton: "دفع",
      modifyButton: "تعديل",
   
   
 
        hoursLabel: "الساعات",
        amountPlaceholder: "395",
        saveButton: "حفظ",
   
        amountLabel: "المبلغ",
        purposeLabel: "الغرض",
  
        baseSalaryLabel: "الراتب الأساسي",
        totalLabel: "الإجمالي",

      // Sales Section
      create_quotation: "إنشاء عرض سعر",
      sales_orders: "أوامر البيع",
      customer: "العملاء",
      customer_list: "قائمة العملاء",
      add_customer: "إضافة عميل",

      // HR Section
      employees: "الموظفين",
      add_employee: "إضافة موظف",
      payroll: "الرواتب",
      position: "المنصب",
      // Accounts Section
      accounts: "الحسابات",
      accounting_tree: "شجرة الحسابات",
      journals: "اليوميات",
      new_journal: "يومية جديدة",
      new_journal_entry: "قيد جديد",
      journal_entries_viewer: "عرض القيود",
employeesSearch: "بحث الموظفين",
      // Delegates/Trips Section
      delegates: "المندوبين",
      create_trip: "إنشاء رحلة",
      cars_list_view: "عرض السيارات",
      add_car: "إضافة سيارة",
      transfer_car: "تحويل",

      // Footer
      settings: "الإعدادات",
      privacy_policy: "سياسة الخصوصية",
      terms_conditions: "الشروط والأحكام",
      akhdar_platform: "منصة أخضر",

      // -------------------------
      // ⭐ Dashboard Home Texts ⭐
      // -------------------------
      dashboard_overview: "نظرة عامة على لوحة التحكم",
      dashboard_welcome: "مرحباً بعودتك! إليك ما يحدث في متجرك اليوم.",

      total_revenue: "إجمالي الإيرادات",
      total_users: "إجمالي المستخدمين",
      total_products: "إجمالي المنتجات",
      monthly_sales: "المبيعات الشهرية",

      recent_activity: "النشاطات الأخيرة",
      view_all: "عرض الكل",

      quick_insights: "رؤى سريعة",
      conversion_rate: "معدل التحويل",
      avg_order_value: "متوسط قيمة الطلب",
      active_sessions: "الجلسات النشطة",

      new_order_received: "تم استلام طلب جديد",
      product_stock_updated: "تم تحديث مخزون المنتج",
      new_user_registered: "تم تسجيل مستخدم جديد",
      payment_received: "تم استلام دفعة",

      // Edit Product Page
      products_management_title: "إدارة المنتجات",
      edit_product_title: "تعديل المنتج",

      product_name: "اسم المنتج",
      description: "الوصف",
      upload: "رفع",
      save_product: "حفظ المنتج",
      loading_product: "جاري تحميل بيانات المنتج...",

      missing_product_id: "رقم المنتج غير موجود. لا يمكن الحفظ.",
      invalid_price: "يرجى إدخال سعر صحيح (أرقام فقط).",
      negative_price: "لا يمكن أن يكون السعر سالباً.",
      invalid_tax: "قيمة الضريبة غير صحيحة.",
      product_updated: "تم تحديث المنتج بنجاح!",
      update_error: "حدث خطأ أثناء تحديث المنتج. راجع الكونسول.",

      // NewProduct / EditProduct / Form specific keys
      new_product: "منتج جديد",
      products_management_header: "إدارة المنتجات",
      breadcrumb_dashboard: "لوحة التحكم",
      breadcrumb_products: "المنتجات",
      new_product_title: "إضافة منتج",
      product_name_label: "اسم المنتج",
      category_label: "الفئة",
      description_label: "الوصف",
      code_label: "الكود",
      price_label: "السعر",
      tax_label: "الضريبة",
      unit_label: "الوحدة",
      total_label: "الإجمالي",
      enter_product_code_placeholder: "أدخل كود المنتج...",
      category_placeholder: "الفئة...",
      select_valid_category: "الرجاء اختيار فئة صحيحة!",
      image_too_large: "❌ حجم الصورة كبير جدا! ارفع صورة أقل من 3 ميجابايت.",
      product_created_success: "✅ تم إنشاء المنتج بنجاح!",
      duplicate_code_error: "❌ هذا الكود مستخدم بالفعل!",
      error_creating_product: "حدث خطأ أثناء إنشاء المنتج.",
      product_details: "تفاصيل المنتج",
      back_to_products: "العودة إلى المنتجات",
      product_image: "صورة المنتج",
      view_product: "عرض المنتج",
employeesTitle:"الموظفين",
       transferred_products: "المنتجات المنقولة",
          from_label: "من",
          to_label: "إلى",
          no_products_transferred: "لا توجد منتجات محولة حتى الآن",
          transfer_id_missing: "معرّف النقل مفقود",
          failed_load_transfer: "فشل تحميل بيانات النقل",
          actions_col: "الإجراءات",
          transfer_from: "نقل من",
          supplier: "المورد",
          expected_delivery_date: "تاريخ التسليم المتوقع",
          order_date: "تاريخ الطلب",
          order_products: "منتجات الطلب",
          update_order: "تحديث الطلب",
          select_supplier: "اختر المورد",
          select_product: "اختر المنتج",
          select_inventory: "اختر المخزون",
inventory_search: "بحث عن مخزن",
      stock_in: "وارد",
      invoice: "فاتورة",
      order_number: "رقم الطلب",
   capacity: "السعة",
    save_inventory: "حفظ المخزون",
    inventory_name: "اسم المخزون",
      supplier_id: "معرف المورد",
      invoice_id: "معرف الفاتورة",
      payment_status: "حالة الدفع",
      organization_order: "المنظمة / الطلب",
      organization_id: "معرف المنظمة",
      purchase_order_id: "معرف أمر الشراء",
      last_updated: "آخر تحديث",
      requested_products: "المنتجات المطلوبة",
      inventory_column: "المخزن",
      payment: "الدفع",
      shipping: "الشحن",
      total_payment: "إجمالي الدفع",
      reported_by: "أبلغ عنه",
      approved_by: "وافق عليه",
      received_by: "استلم بواسطة",
      print: "طباعة",
      download_pdf: "تحميل PDF",
      loading_invoice: "جارٍ تحميل الفاتورة...",
      // --- additional Arabic keys (from your JSON) ---
      "unknown_product": "منتج غير معروف",
      "n_a": "غير متوفر",
      "currency_sr": "ريال",
      "failed_load_stocks": "فشل تحميل المخزون",
      "unnamed_inventory": "مخزون بدون اسم",
      "location_label": "الموقع:",
      "capacity_label": "السعة:",
      "edit_details_btn": "تعديل التفاصيل",
      "delete_btn": "حذف",
      "id_label": "الرقم:",
      "inventory_products": "منتجات المخزون",
      "manage_stocks": "إدارة المخزون",
      "edit_label": "تعديل",
      "show_label": "عرض",
      "entries_label": "إدخالات",
      "previous_label": "السابق",
      "next_label": "التالي",
      "edit_quantity_label": "الكمية",
      "edit_price_label": "السعر",
      "cancel_label": "إلغاء",
      "save_label": "حفظ",
      "saving_label": "جاري الحفظ...",
      "loading_inventory_details": "جاري تحميل تفاصيل المخزون...",
      "confirm_delete_inventory": "هل أنت متأكد من حذف هذا المخزون؟",
      "failed_delete_inventory": "فشل حذف المخزون",
      "cannot_determine_stock_id": "لا يمكن تحديد معرف المخزون",
      "failed_update_stock": "فشل تحديث المخزون",
      "failed_delete_stock": "فشل حذف المخزون",



"Delegates": "المندوبون",
"Delegates Management": "إدارة المندوبين",
"Trip": "الرحلة",
"Expenses": "المصاريف",
"End Time": "وقت الانتهاء",
"New Order": "طلب جديد",
"Orders": "الطلبات",
"Showing 1-10 of 47 products": "عرض 1-10 من 47 منتج",
"Order number": "رقم الطلب",
"Customer": "العميل",
"Total Price": "السعر الكلي",
"Order Time": "وقت الطلب",
"Action": "الإجراء",
"view": "عرض",
"Invoice": "فاتورة",
"Inventory": "المخزون",
"Stock out": "نفاد المخزون",
"Sales Management": "إدارة المبيعات",
"Invoice number:": "رقم الفاتورة:",
"Created by": "تم الإنشاء بواسطة",
"Order Date": "تاريخ الطلب",
"Select customer...": "اختر العميل...",
"Add Products": "إضافة منتجات",
"Product": "المنتج",
"Code": "الرمز",
"Units": "الوحدات",
"Price": "السعر",
"Discount": "الخصم",
"Total": "الإجمالي",
"Add Product": "إضافة منتج",
"Cancel": "إلغاء",
"Received Products": "المنتجات المستلمة",
"Notes": "ملاحظات",
"Add notes here...": "أضف ملاحظات هنا...",


"carManagement": "إدارة السيارات",
  "editDetails": "تعديل التفاصيل",
  "carItemsTitle": "عناصر السيارة",
  "tableItem": "العنصر",
  "tableCategory": "الفئة",
  "tableUnits": "الوحدات",
  "tablePrice": "السعر",
  "tableTotal": "الإجمالي",
  "loadingItems": "جاري تحميل العناصر...",
  "noItemsFound": "لا توجد عناصر",
  "deleteItemConfirm": "هل أنت متأكد من حذف هذا العنصر من السيارة؟",
  "editCarItemTitle": "تعديل عنصر السيارة",
  "labelItem": "العنصر",
  "labelQuantity": "الكمية",
  "labelPriceSR": "السعر (ر.س)",


  "Production": "الإنتاج",
  "Statistics": "الإحصائيات",
  "Revenue": "الإيرادات",
  "Expanses": "المصروفات",
  "Profit": "الأرباح",
  "Bank": "البنك",
  "Accounts Receivable": "حسابات القبض",
  "Accounts Payable": "حسابات الدفع",
  "Net & Gross Profit": "صافي وإجمالي الربح",
  "Net profit": "صافي الربح",
  "Gross profit": "إجمالي الربح",
  "Monthly Profit": "الأرباح الشهرية",
  "Loading...": "جاري التحميل...",


      "Cars": "السيارات",
      "Cars_Management": "إدارة السيارات",
      "Add_Car": "إضافة سيارة",
      "Car_Search": "بحث السيارات",
      "search_car_placeholder": "ابحث عن السيارة بالاسم، المعرف، أو الموقع",
      "Search": "بحث",
      "Reset": "إعادة تعيين",
      "no_cars_found": "لم يتم العثور على سيارات تطابق بحثك.",
      "Last_Updated": "آخر تحديث",
      "Unnamed_Car": "سيارة بدون اسم",



"Transfer_Management": "إدارة النقل",
        "Transfer": "نقل",
        "car": "سيارة",
        "Transfer_from": "نقل من",
        "Loading_inventory": "جاري تحميل المخزون...",
        "Select_inventory": "اختر مخزون",
        "select_from_first": "اختر مخزون \"نقل من\" أولاً",
        "Loading_products": "جاري تحميل المنتجات...",
        "Select_product": "اختر منتج",
        "available": "متاح",
        "To": "إلى",
        "Loading_car": "جاري تحميل السيارات...",
        "Select_car": "اختر سيارة",
        "Reference": "المرجع",
        "Enter_reference_number": "أدخل رقم المرجع",
        "Shipping_Cost": "تكلفة الشحن",
        "Transferring": "جاري النقل...",
        "Transferred_Products": "المنتجات المنقولة",
        "From": "من",
        "no_transferred_products_yet": "لا توجد منتجات منقولة بعد",
        "Saving": "جاري الحفظ...",
        "Save_Transfer": "حفظ النقل",
        "select_transfer_from_first": "الرجاء اختيار مخزون \"نقل من\" أولاً.",
        "select_product_transfer": "الرجاء اختيار منتج للنقل.",
        "select_to_inventory": "الرجاء اختيار مخزون \"إلى\".",
        "source_dest_different": "يجب أن يكون المخزون المصدر والوجهة مختلفين.",
        "units_greater_zero": "يجب أن تكون الوحدات أكبر من 0.",
        "price_zero_greater": "يجب أن يكون السعر 0 أو أكبر.",
        "select_from_before_saving": "الرجاء اختيار \"نقل من\" قبل الحفظ.",
        "select_to_before_saving": "الرجاء اختيار \"إلى\" قبل الحفظ.",
        "no_products_to_save": "لا توجد منتجات منقولة للحفظ.",
        "invalid_product_rows": "لا يحتوي أي من صفوف الجدول على معرف منتج صالح - الرجاء إضافة منتجات من القائمة المنسدلة.",
        "quantity_exceeds_available": "❌ الكمية المطلوبة ({{requested}}) تتجاوز المتاح ({{available}}) للمنتج {{name}}",
        "transfer_created_success": "✅ تم إنشاء نقل المخزون بنجاح",
        "failed_save_transfer": "فشل حفظ النقل. راجع وحدة التحكم للتفاصيل. حالة الخادم:",






 "Journal Entries Viewer": "عرض قيود اليومية",


"Accounting Management": "إدارة المحاسبة",
  "Add Journal": "إضافة دفتر يومية",
  "Search by name, type, or code...": "ابحث بالاسم أو النوع أو الكود...",
  "Type": "النوع",
  "Created": "تاريخ الإنشاء",
  "Actions": "الإجراءات",
  "N/A": "غير متوفر",
  "No journals found": "لم يتم العثور على دفاتر يومية",
  "Prev": "السابق",
  "Are you sure you want to delete \"{name}\"?": "هل أنت متأكد من حذف \"{name}\"؟",
  "Journal deleted successfully!": "تم حذف دفتر اليومية بنجاح!",
  "Failed to delete journal": "فشل في حذف دفتر اليومية",

  "Journal Entries": "قيود اليومية",
  "Select Journal": "اختر دفتر اليومية",
  "Refresh": "تحديث",
  "Choose Journal": "اختر دفتر اليومية",
  "-- Select a Journal --": "-- اختر دفتر يومية --",
  "Selected Journal": "دفتر اليومية المحدد",
  "Code:": "الكود:",
  "Total Debit": "إجمالي المدين",
  "Total Credit": "إجمالي الدائن",
  "SR": "ريال",
  "✓ Balanced": "✓ متوازن",
  "✗ Unbalanced": "✗ غير متوازن",
  "Loading journal entries...": "جاري تحميل القيود...",
  "No Journal Selected": "لم يتم اختيار دفتر يومية",
  "Please select a journal from the dropdown above to view its entries.": "الرجاء اختيار دفتر يومية من القائمة أعلاه لعرض قيوده.",
  "No Entries Found": "لا توجد قيود",
  "This journal doesn't have any entries yet.": "هذا الدفتر لا يحتوي على أي قيود حتى الآن.",
  "Entry ID": "رقم القيد",
  "Created At": "تاريخ الإنشاء",
  "Delete Entry": "حذف القيد",
  "Account": "الحساب",
  "Description": "الوصف",
  "Debit (SR)": "مدين (ريال)",
  "Credit (SR)": "دائن (ريال)",
  "Entry Total:": "إجمالي القيد:",
  "Grand Total": "الإجمالي الكلي",
  "Debit": "مدين",
  "Credit": "دائن",
  "Unknown Account": "حساب غير معروف",
  "Are you sure you want to delete this entry?": "هل أنت متأكد من حذف هذا القيد؟",
  "✅ Entry deleted successfully": "✅ تم حذف القيد بنجاح",
  "❌ Error deleting entry": "❌ خطأ في حذف القيد",
  "✅ Entries refreshed": "✅ تم تحديث القيود",
  "❌ Error refreshing entries": "❌ خطأ في تحديث القيود",




  "cars": "السيارات",
  "addCarTitle": "إضافة سيارة",
  "carName": "اسم السيارة",
  "brand": "العلامة التجارية",
  "year": "السنة",
  "imagePreview": "معاينة الصورة",
  "uploadImage": "رفع صورة",
  "changeImage": "تغيير الصورة",
  "saveCar": "حفظ السيارة",
  "carNameRequired": "اسم السيارة مطلوب",
  "brandRequired": "العلامة التجارية مطلوبة",
  "yearRequired": "سنة الصنع مطلوبة",
  "carAddedSuccess": "تم إضافة السيارة بنجاح!",


"Journal Management": "إدارة دفاتر اليومية",
  "New Journal": "دفتر يومية جديد",
  "Create New Journal": "إنشاء دفتر يومية جديد",
  "إنشاء دفتر يومية جديد": "إنشاء دفتر يومية جديد",
  "Journal Name": "اسم دفتر اليومية",
  "Enter journal name": "أدخل اسم دفتر اليومية",
  "Journal Type": "نوع دفتر اليومية",
  "-- Select Journal Type --": "-- اختر نوع دفتر اليومية --",
  "➕ Add new type...": "➕ إضافة نوع جديد...",
  "Write new journal type...": "اكتب نوع دفتر يومية جديد...",
  "Journal Code": "كود دفتر اليومية",
  "Enter unique journal code": "أدخل كود فريد لدفتر اليومية",
  "About Journals": "حول دفاتر اليومية",
  "Journals are used to record financial transactions.": "تُستخدم دفاتر اليومية لتسجيل المعاملات المالية.",
  "Saving...": "جاري الحفظ...",
  "Save Journal": "حفظ دفتر اليومية",
  "❌ Please enter journal name!": "❌ الرجاء إدخال اسم دفتر اليومية!",
  "❌ Please enter journal code!": "❌ الرجاء إدخال كود دفتر اليومية!",
  "❌ Please enter or select journal type!": "❌ الرجاء إدخال أو اختيار نوع دفتر اليومية!",
  "❌ This journal code is already in use!": "❌ هذا الكود مستخدم بالفعل!",
  "✅ Journal created successfully!": "✅ تم إنشاء دفتر اليومية بنجاح!",
  "❌ Error creating journal. Please try again.": "❌ خطأ في إنشاء دفتر اليومية. الرجاء المحاولة مرة أخرى.",




  "Select Agent..." : "حدد الوكيل",
"Enter Location...": "أختار مكان",
"Enter driver name...": "أختار اسم السائق",
"Select Car...": "أختار سيارة",
"Select Area..." : "تحديد المنطقة",
  

  "Select a journal...": "اختر دفتر اليومية...",
  "Select account...": "اختر الحساب...",
  "Enter description...": "أدخل الوصف...",
  "Save Entry": "حفظ القيد",
  "Please select a journal!": "الرجاء اختيار دفتر اليومية!",
  "Please fill all line details!": "الرجاء تعبئة جميع تفاصيل السطور!",
  "Entry is not balanced! Debit must equal Credit.": "القيد غير متوازن! المدين يجب أن يساوي الدائن.",
  "Journal entry created successfully!": "تم إنشاء القيد بنجاح!",
  "Error creating journal entry. Please try again.": "حدث خطأ أثناء إنشاء القيد. حاول مرة أخرى.",
  "Error fetching journals or accounts.": "حدث خطأ أثناء جلب دفاتر اليومية أو الحسابات.",
"totalTrips": "كل الرحلات",




// Modal / Modify salary
"modify_salary": "تعديل الراتب",
"hours_label": "عدد الساعات",
"amount_placeholder": "المبلغ",

"amount_label": "المبلغ",
"purpose_label": "الغرض",

"": "إجمالي الراتب",
"base_salary": "الراتب الأساسي",


"added_success": "تم الحفظ بنجاح",



// Months

"January": "يناير",
"February": "فبراير",
"March": "مارس",
"April": "أبريل",
"May": "مايو",
"June": "يونيو",
"July": "يوليو",
"August": "أغسطس",
"September": "سبتمبر",
"October": "أكتوبر",
"November": "نوفمبر",
"December": "ديسمبر",




"all": "الكل",
"paid": "تم الدفع",
"unpaid": "غير مدفوع",




"all_departments": "كل الأقسام",
"technical_support": "الدعم الفني",
"software": "البرمجيات",





    "jobTitle": "المسمّى الوظيفي",
    "nationalId": "الرقم القومي",
    "dateOfBirth": "تاريخ الميلاد",
 
    "alternatePhone": "رقم هاتف بديل",
    "workLocation": "مقر العمل",
    "level": "مستوى الخبرة",
    "employmentType": "نوع التوظيف",
    "dateOfEmployment": "تاريخ التعيين",

  "sales_order": "أوامر البيع",
  "action": "الإجراء",


"hrManagement": "إدارة الموارد البشرية",
  "pay": "دفع",
  "modify": "تعديل",
  "modifySalary": "تعديل الراتب",
  "hoursPlaceholder": "2 ساعات",
  "amount": "المبلغ",
  "purpose": "السبب",
  "totalSalary": "إجمالي الراتب",
  "baseSalary": "الراتب الأساسي",
  "currencySR": "ر.س",
  "All": "الكل",
  "Paid": "مدفوع",
  "Unpaid": "غير مدفوع",
  "All Departments": "كل الأقسام",
  "Sales": "المبيعات",
  "Technical Support": "الدعم الفني",
  "HR": "الموارد البشرية",
  "Software": "البرمجيات",

  "Trips Management": "إدارة الرحلات",
  "Dashboard > Delegates": "لوحة التحكم > المندوبون",
  "Trips": "الرحلات",
  "Showing 1-10 of {totalTrips} Trips": "عرض 1-10 من {totalTrips} رحلات",
  "Trip number": "رقم الرحلة",
  "Agent": "المندوب",
  "Driver": "السائق",
  "Area": "المنطقة",
  "Date": "التاريخ",
  "Status": "الحالة",
  "Continue": "متابعة",




      "breadcrumb_attendance": "لوحة التحكم > الحضور",
      "employees_search": "بحث الموظفين",
      "add_new_attendance": "إضافة حضور جديد",
      
      // Buttons
      "daily": "يومي",
      "monthly": "شهري",
      "special_day": "اليوم الخاص",
      "check_in": "تسجيل الدخول",
      "check_out": "تسجيل الخروج",
      "add_attendance": "إضافة حضور",

      // Inputs / Labels

      "present": "حاضر",
      "absent": "غائب",
      "late": "متأخر",
      "showing_entries": "عرض {{start}}-{{end}} من أصل {{total}} موظف",
      "show_entries": "عرض {{count}} سجلات",

      // Status codes

      "status_P": "حاضر",
      "status_A": "غائب",

  "failed_to_load": "فشل التحميل",
  "order_approved": "✅ تم اعتماد الطلب بنجاح!",
  "order_delivered": "🚚 تم تسليم الطلب بنجاح!",
  "action_failed": "❌ فشل العملية",
  "loading_user": "جاري تحميل المستخدم...",
      "order_id_missing": "معرف الطلب مفقود",
      "please_fill_shipping_fees": "يرجى إدخال رسوم الشحن",
      "shipping_fees_must_number": "يجب أن تكون رسوم الشحن رقماً",
      "shipping_cost_updated": "تم تحديث تكلفة الشحن بنجاح",
      "shipping_label": "الشحن",
      "shipping_cost": "تكلفة الشحن",
      "order_number_label": "رقم الطلب:",
      "shipping_fees_label": "رسوم الشحن",
      "operation_date_label": "تاريخ العملية",
      "save_transfer_label": "حفظ النقل",



  
    "personalDetails": "البيانات الشخصية",
    "jobDetails": "بيانات الوظيفة",





      "label": "اختر الدفتر",
      "placeholder": "-- اختر دفتر يومية --",
      "refresh": "تحديث",
      "selectedLabel": "الدفتر المختار",
      "codeLabel": "الرمز: {{code}}",
      "loadingEntries": "جاري تحميل القيود...",
        "message": "الرجاء اختيار دفتر يومية من القائمة أعلاه لعرض القيود.",
    

      "totalDebit": "إجمالي المدين",
      "totalCredit": "إجمالي الدائن",

      "balanced": "✓ متوازن",
      "unbalanced": "✗ غير متوازن",

      "entryIdLabel": "معرّف القيد",
      "createdAtLabel": "تاريخ الإنشاء",
      "deleteButtonTitle": "حذف القيد",

        "index": "#",
        "account": "الحساب",
        "debit": "مدين (ر.س)",
        "credit": "دائن (ر.س)",
        "entryTotalLabel": "مجموع القيد:",
 
        "unknown": "حساب غير معروف",

      "entryDeleted": "✅ تم حذف القيد بنجاح",
      "entryDeleteError": "❌ خطأ عند حذف القيد",
      "entriesRefreshed": "✅ تم تحديث القيود",

  
    "addJournal": "إضافة دفتر",
      "button": "بحث",

      "created": "تاريخ الإنشاء",
      "noJournals": "لا توجد دفاتر",
 
      "delete": "هل أنت متأكد أنك تريد حذف \"{{name}}\"؟",
 
      "deleted": "تم حذف الدفتر بنجاح!",
      "deleteFailed": "فشل حذف الدفتر",

      "prev": "السابق",
  
    "pageTitle": "إدارة الدفاتر",

    "titleArabicNote": "إنشاء دفتر يومية جديد",

    
      "typePlaceholder": "-- اختر نوع الدفتر --",
      "typeAddOption": "➕ إضافة نوع جديد...",
      "typeCustomPlaceholder": "اكتب نوع دفتر جديد...",
  
      "heading": "عن الدفاتر",
      "body": "تستخدم الدفاتر لتسجيل المعاملات المالية.",
   

      "missingName": "❌ الرجاء إدخال اسم الدفتر!",
      "missingCode": "❌ الرجاء إدخال رمز الدفتر!",
      "missingType": "❌ الرجاء اختيار أو إدخال نوع الدفتر!",
      "duplicateCode": "❌ هذا الرمز مستخدم بالفعل!",
      "createError": "❌ خطأ أثناء إنشاء الدفتر. حاول مرة أخرى.",

    "selectJournalLabel": "اختر دفتر",
    "selectJournalPlaceholder": "اختر دفترًا...",
    "selectAccountPlaceholder": "اختر حسابًا...",



      "descriptionPlaceholder": "أدخل الوصف...",
    

      "selectJournal": "❌ الرجاء اختيار دفتر!",
      "fillLines": "❌ الرجاء تعبئة تفاصيل الأسطر!",
      "notBalanced": "❌ القيد غير متوازن! يجب أن يساوي المدين الدائن.",
      "fetchError": "❌ خطأ أثناء جلب الدفاتر أو الحسابات.",
      "createErrorGeneric": "حدث خطأ أثناء إنشاء القيد. حاول مرة أخرى.",

      "balancedRequired": "يجب أن يكون القيد متوازناً وغير صفري.",



    "editImage": "تعديل الصورة",
    "mmddyyyy": "يوم/شهر/سنة",
    "saveDetails": "حفظ المعلومات",

      "supplier_label": "المورد",
      "currency_label": "العملة",
      "add_products": "إضافة منتجات",
      "product_label": "المنتج",
      "inventory_label": "المخزن",
      "units_label": "الوحدات",
      "discount_label": "الخصم",
      "reset_btn": "إعادة تعيين",
      "add_product_btn": "+ إضافة منتج",
      "received_products": "المنتجات المستلمة",
      "product_col": "المنتج",
      "inventory_col": "المخزن",
      "code_col": "الكود",
      "units_col": "الوحدات",
      "price_col": "السعر",
      "discount_col": "الخصم",
      "total_col": "الإجمالي",
      "notes_label": "ملاحظات",
      "add_notes_placeholder": "أضف أي ملاحظات هنا...",
      "save_order_btn": "حفظ الطلب",
      "loading_suppliers": "جاري تحميل الموردين...",
      "loading_inventories": "جاري تحميل المخازن...",
      "please_select_product": "يرجى اختيار منتج",
      "please_select_inventory": "يرجى اختيار مخزن",
      "units_must_greater_zero": "يجب أن تكون الوحدات أكبر من 0",
      "price_must_greater_zero": "يجب أن يكون السعر أكبر من 0",
      "please_select_supplier_before_saving": "يرجى اختيار مورد قبل الحفظ",
      "please_add_at_least_one_product": "يرجى إضافة منتج واحد على الأقل",
      "order_saved_successfully": "تم حفظ الطلب بنجاح",
      "failed_save_order_check_console": "فشل حفظ الطلب. تحقق من وحدة التحكم للحصول على التفاصيل",


      "purchase_order": "أمر شراء",
      "invoice_number": "رقم الفاتورة",
      "invoice_date": "تاريخ الفاتورة",
      "company_info": "معلومات الشركة",
      "warehouse_id": "معرف المستودع",
      "quantity_label": "الكمية",
      "subtotal_label": "المجموع الفرعي",
      "tax_14": "الضريبة (14%)",
      "back_btn": "رجوع",
      "edit_btn": "تعديل",
      "create_invoice_btn": "إنشاء فاتورة",
      "creating_label": "جاري الإنشاء...",
      "export_btn": "تصدير",
      "unexpected_server_response": "استجابة غير متوقعة من الخادم - يرجى الاتصال بالمسؤول",
      "server_returned_welcome_erp": "أعاد الخادم \"مرحبًا بك في ERP\" - الطلب وصل إلى نقطة نهاية خاطئة (خادم التطوير)",
      "invoice_created_successfully": "تم إنشاء الفاتورة بنجاح!",
      "failed_create_invoice": "فشل إنشاء الفاتورة",
      "loading_purchase_order_details": "⏳ جاري تحميل تفاصيل أمر الشراء...",
      "failed_load_purchase_order": "❌ فشل تحميل أمر الشراء",
      "no_purchase_order_data_found": "⚠️ لم يتم العثور على بيانات أمر الشراء للمعرف",
      "error_label": "خطأ",
      "stock_in_draft": "مسودة إدخال المخزون",

      "customer_label": "العميل",
      "loading_customers": "جاري تحميل العملاء...",
      "select_customer": "اختر عميل",
      "select_pro": "اختر منتج",
      "select_inv": "اختر مخزن",
      "no_products_added_yet": "لم تتم إضافة أي منتجات بعد",
      "please_select_customer_before_saving": "يرجى اختيار عميل قبل الحفظ",
      "invalid_product_fields_check_console": "حقل واحد أو أكثر من المنتجات مفقود (productId/inventoryId/quantity). تحقق من وحدة التحكم",
      "shipping_cost_must_valid_number": "يجب أن تكون تكلفة الشحن رقماً صحيحاً غير سالب",
      "sale_order_saved_successfully": "تم حفظ طلب البيع بنجاح",
      "failed_save_sale_order_check_console": "فشل حفظ طلب البيع. تحقق من وحدة التحكم للحصول على التفاصيل",
      "stock_out": "إخراج مخزون",

      "precious": "بريشوس",
  "invoices": "الفواتير",
  "management_precious": "إدارة بريشوس",
  "partial": "جزئي",
  "showing_invoices": "عرض الفواتير {start}-{end} من أصل {total}",
  "invoices_text": "فواتير",

  "total_due": "المبلغ الإجمالي المستحق",
  "remaining": "المتبقي",
  "last_payment": "آخر دفعة",

  "transactions": "التحويلات",


      "category_col": "الفئة",
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: Cookies.get("language") || "ar",
    fallbackLng: "ar",
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;

