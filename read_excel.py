import pandas as pd

try:
    # Open the Excel file
    excel_file = pd.ExcelFile("technical coding 2Library Management (1).xlsx")
    
    # Print sheet names
    print("Sheet names:")
    for sheet_name in excel_file.sheet_names:
        print(f"- {sheet_name}")
        
    # Print first few rows of each sheet
    for sheet_name in excel_file.sheet_names:
        print(f"\n\nContents of sheet: {sheet_name}")
        df = pd.read_excel(excel_file, sheet_name=sheet_name)
        print(df.head())
except Exception as e:
    print(f"Error: {e}") 