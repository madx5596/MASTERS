-- Migration 002: Hierarchical Category Tree System
-- Adds universal category tree structure for all service types

-- ============ ENUMS ============
CREATE TYPE category_status AS ENUM ('ACTIVE', 'HIDDEN', 'ARCHIVED');

-- ============ CATEGORIES (HIERARCHICAL TREE) ============
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL,
  description TEXT,
  icon VARCHAR(50),
  image TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  status category_status NOT NULL DEFAULT 'ACTIVE',
  is_visible BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT categories_slug_unique UNIQUE (slug),
  CONSTRAINT categories_sort_order_check CHECK (sort_order >= 0)
);

-- Indexes for performance
CREATE INDEX idx_categories_parent ON categories(parent_id);
CREATE INDEX idx_categories_slug ON categories(slug);
CREATE INDEX idx_categories_status ON categories(status);
CREATE INDEX idx_categories_sort ON categories(sort_order);
CREATE INDEX idx_categories_visible ON categories(is_visible);

-- ============ UPDATE SERVICES TABLE ============
-- Add foreign key to new categories table
-- Note: We keep service_categories for backward compatibility during migration
ALTER TABLE services 
  ADD COLUMN IF NOT EXISTS category_id_new UUID REFERENCES categories(id) ON DELETE SET NULL;

-- Create index for new category reference
CREATE INDEX IF NOT EXISTS idx_services_category_new ON services(category_id_new);

-- ============ PROVIDER CATEGORIES (Many-to-Many) ============
-- Allows providers to work in multiple categories
CREATE TABLE provider_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  CONSTRAINT provider_categories_unique UNIQUE (provider_id, category_id)
);

CREATE INDEX idx_provider_categories_provider ON provider_categories(provider_id);
CREATE INDEX idx_provider_categories_category ON provider_categories(category_id);

-- ============ FUNCTIONS ============

-- Function to prevent circular references
CREATE OR REPLACE FUNCTION check_category_cycle()
RETURNS TRIGGER AS $$
DECLARE
  current_id UUID;
  parent_uuid UUID;
  depth INTEGER := 0;
  max_depth INTEGER := 100;
BEGIN
  -- Only check if parent_id is being set
  IF NEW.parent_id IS NULL THEN
    RETURN NEW;
  END IF;
  
  -- Walk up the tree to check for cycles
  current_id := NEW.parent_id;
  WHILE current_id IS NOT NULL AND depth < max_depth LOOP
    -- If we find the current category in its own ancestry, it's a cycle
    IF current_id = NEW.id THEN
      RAISE EXCEPTION 'Circular reference detected in category hierarchy';
    END IF;
    
    -- Get parent of current node
    SELECT parent_id INTO parent_uuid FROM categories WHERE id = current_id;
    current_id := parent_uuid;
    depth := depth + 1;
  END LOOP;
  
  IF depth >= max_depth THEN
    RAISE EXCEPTION 'Category hierarchy too deep (max % levels)', max_depth;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to check for cycles on INSERT/UPDATE
CREATE TRIGGER trg_check_category_cycle
  BEFORE INSERT OR UPDATE ON categories
  FOR EACH ROW
  EXECUTE FUNCTION check_category_cycle();

-- Function to auto-generate slug from name
CREATE OR REPLACE FUNCTION generate_category_slug()
RETURNS TRIGGER AS $$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter INTEGER := 1;
BEGIN
  -- Only generate if slug is empty or NULL
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    -- Convert name to slug format
    base_slug := lower(NEW.name);
    base_slug := regexp_replace(base_slug, '[^a-z0-9а-яё\s-]', '', 'g');
    base_slug := regexp_replace(base_slug, '[\s]+', '-', 'g');
    base_slug := regexp_replace(base_slug, '-+', '-', 'g');
    base_slug := trim(base_slug, '-');
    
    final_slug := base_slug;
    
    -- Ensure uniqueness
    WHILE EXISTS (SELECT 1 FROM categories WHERE slug = final_slug AND id != NEW.id) LOOP
      final_slug := base_slug || '-' || counter;
      counter := counter + 1;
    END LOOP;
    
    NEW.slug := final_slug;
  END IF;
  
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate slug
CREATE TRIGGER trg_generate_category_slug
  BEFORE INSERT OR UPDATE ON categories
  FOR EACH ROW
  EXECUTE FUNCTION generate_category_slug();

-- ============ VIEWS ============

-- View for category tree with counts
CREATE OR REPLACE VIEW category_tree_view AS
SELECT 
  c.*,
  COALESCE(child_count.count, 0) as children_count,
  COALESCE(service_count.count, 0) as services_count,
  COALESCE(provider_count.count, 0) as providers_count
FROM categories c
LEFT JOIN (
  SELECT parent_id, COUNT(*) as count 
  FROM categories 
  WHERE status != 'ARCHIVED'
  GROUP BY parent_id
) child_count ON c.id = child_count.parent_id
LEFT JOIN (
  SELECT category_id_new, COUNT(*) as count 
  FROM services 
  WHERE status = 'ACTIVE'
  GROUP BY category_id_new
) service_count ON c.id = service_count.category_id_new
LEFT JOIN (
  SELECT category_id, COUNT(DISTINCT provider_id) as count 
  FROM provider_categories 
  GROUP BY category_id
) provider_count ON c.id = provider_count.category_id;

-- ============ COMMENTS ============
COMMENT ON TABLE categories IS 'Hierarchical category tree for all service types';
COMMENT ON COLUMN categories.parent_id IS 'Parent category ID (NULL for root categories)';
COMMENT ON COLUMN categories.slug IS 'URL-friendly unique identifier';
COMMENT ON COLUMN categories.status IS 'ACTIVE=visible, HIDDEN=exists but not shown, ARCHIVED=deprecated';
COMMENT ON COLUMN categories.is_visible IS 'Additional flag for client visibility';
COMMENT ON COLUMN categories.sort_order IS 'Order within same parent level';

COMMENT ON TABLE provider_categories IS 'Many-to-many relationship between providers and categories';
COMMENT ON COLUMN provider_categories.provider_id IS 'Provider who works in this category';
COMMENT ON COLUMN provider_categories.category_id IS 'Category the provider works in';
