# Supabase Migration Plan - PhoneShopSystem

This plan outlines the steps to complete the migration from NestJS to Supabase while maintaining the original business logic.

## 1. Frontend Changes (Completed)
- Installed `@supabase/supabase-js`.
- Created `src/services/supabaseClient.ts` to initialize the connection.
- Rewrote `src/services/api.ts` to use Supabase while mimicking Axios error responses for compatibility with existing UI components.

## 2. Supabase Backend Setup (Required)
The following SQL should be executed in the Supabase SQL Editor to ensure the schema matches the NestJS logic.

### 2.1 Table Schema Fixes
The existing tables might need column adjustments to match the NestJS entities exactly.

```sql
-- Ensure products table has correct columns
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES categories(id),
ADD COLUMN IF NOT EXISTS sell_price NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS unit TEXT DEFAULT 'Cái',
ADD COLUMN IF NOT EXISTS image TEXT,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'ACTIVE';

-- Rename or adjust categories if they are for finance
-- (Optional: if the current categories table is for PocketFlow)
```

### 2.2 Business Logic (RPC Functions)
The following complex operations must be implemented as PostgreSQL functions (RPC) to maintain atomicity and business rules.

#### Create Import Receipt
Handles creating the receipt, adding stock entries, and recording movements.
```sql
CREATE OR REPLACE FUNCTION create_import_receipt(data_json JSONB)
RETURNS JSONB LANGUAGE plpgsql AS $$
DECLARE
    receipt_id UUID;
    item RECORD;
BEGIN
    -- Insert receipt
    INSERT INTO import_receipts (supplier_id, code, total_amount, note, status)
    VALUES (
        (data_json->>'supplierId')::UUID,
        data_json->>'code',
        (data_json->>'totalAmount')::NUMERIC,
        data_json->>'note',
        data_json->>'status'
    ) RETURNING id INTO receipt_id;

    -- Insert items into stocks and record movements
    FOR item IN SELECT * FROM jsonb_array_elements(data_json->'items')
    LOOP
        INSERT INTO stocks (product_id, receipt_id, quantity, initial_quantity, unit_cost, status)
        VALUES (
            (item.value->>'productId')::UUID,
            receipt_id,
            (item.value->>'quantity')::INT,
            (item.value->>'quantity')::INT,
            (item.value->>'importPrice')::NUMERIC,
            'AVAILABLE'
        );

        INSERT INTO stock_movements (product_id, movement_type, quantity, reference_type, reference_id)
        VALUES (
            (item.value->>'productId')::UUID,
            'IN',
            (item.value->>'quantity')::INT,
            'IMPORT',
            receipt_id
        );
    END LOOP;

    RETURN jsonb_build_object('id', receipt_id, 'success', true);
END;
$$;
```

### 2.3 Storage Buckets
Create a bucket named `post-images` with public access for social media post images.

## 3. Next Steps
1. Execute the SQL above in Supabase.
2. Verify the `id` types (UUID vs INT). The current frontend uses `any` for compatibility, but ensure Supabase tables use UUIDs or adjust the `INSERT` logic accordingly.
3. Replace the `.env.local` variables with your actual Supabase credentials if they differ from the ones provided.
