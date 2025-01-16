
-- Assignment2 - Tasks 1/1-6 queries: Insert, Update, Delete, Join, Update statements

-- Insert a new account into the account table
INSERT INTO public.account (account_firstname, account_lastname, account_email, account_password)
VALUES ('Tony', 'Stark', 'tony@starkent.com', 'Iam1ronM@n');

-- Update the account with the email address '
UPDATE public.account
SET account_type = 'Admin'
WHERE account_email = 'tony@starkent.com';

-- Delete the account with the email address '
DELETE FROM public.account
WHERE account_email = 'tony@starkent.com';

-- Update the inventory table to replace 'small interiors' with 'a huge interior' for GM Hummers
UPDATE public.inventory
SET inv_description = REPLACE(inv_description, 'small interiors', 'a huge interior')
WHERE inv_make = 'GM' AND inv_model = 'Hummer';

-- Inner Join the inventory and classification tables to get the make, model, and classification name for all vehicles with a classification of 'Sport'
SELECT i.inv_make, i.inv_model, c.classification_name
FROM public.inventory i
INNER JOIN public.classification c
ON i.classification_id = c.classification_id
WHERE c.classification_name = 'Sport';

-- Update the inventory table to replace '/images/' with '/images/vehicles/' for the inv_image and inv_thumbnail columns
UPDATE public.inventory
SET inv_image = REPLACE(inv_image, '/images/', '/images/vehicles/'),
    inv_thumbnail = REPLACE(inv_thumbnail, '/images/', '/images/vehicles/');

