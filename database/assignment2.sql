-- Assignment 2 - Task 1

-- 1. Insert into account table
INSERT INTO 
    public.account (
    account_firstname,
    account_lastname,
    account_email,
    account_password
  )
VALUES (
    'Tony',
    'Stark',
    'tony@starkent.com',
    'Iam1ronM@n'
);

-- 2. Modify Tony Stark record account_type to Admin
UPDATE 
    public.account
SET 
    account_type = 'Admin'
WHERE
    account_id = 1;

-- 3. Delete Tony Stark from the database
DELETE FROM 
    public.account 
WHERE 
    account_id = 1;

-- 4. Modify "GM Hummer" replace "a huge interior" with "the small interiors"
UPDATE 
    public.inventory 
SET 
    inv_description = REPLACE(inv_description, 'the small interiors', 'a huge interior') 
WHERE 
    inv_id = 10;

-- 5. Select make and model from inventory, name from classification for the Sport category
SELECT
    inv_make, inv_model, classification_name
FROM public.inventory
    JOIN public.classification
        ON inventory.classification_id = classification.classification_id
WHERE
    classification_name = 'Sport';

-- 6. Update inventory table add "/vehicles" to file path in inv_image & inv_thumbnail
UPDATE 
    public.inventory
SET
    inv_image = REPLACE(inv_image, 'images', 'images/vehicles'),
    inv_thumbnail = REPLACE(inv_thumbnail, 'images', 'images/vehicles');