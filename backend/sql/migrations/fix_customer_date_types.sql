-- Change dob and anniversary_date to DATE type to avoid timezone shifts
ALTER TABLE customers 
ALTER COLUMN dob TYPE DATE,
ALTER COLUMN anniversary_date TYPE DATE;
