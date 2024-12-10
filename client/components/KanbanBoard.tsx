"use client";

import React, { useState, forwardRef, useImperativeHandle, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Plus, Trash2 } from 'lucide-react';
import { Product } from '@/types/product';
import { createProduct, updateProductCategory, getAllProducts } from '@/services/productService';

// Define the category type
interface Category {
  id: string;
  name: string;
  products: Product[];
}

const KanbanBoard = forwardRef((props, ref) => {
  // Initial state with Uncategorized category
  const [categories, setCategories] = useState<Category[]>([
    {
      id: 'uncategorized',
      name: 'Uncategorized',
      products: []
    }
  ]);

  // State for new category input
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Fetch initial data
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        const response = await getAllProducts();
        const products = Array.isArray(response.products) ? response.products : [];
        console.log('Fetched products:', response.products);
        
        // Create a map of categories and their products
        const categoryMap = new Map<string, Product[]>();
        
        // Initialize with uncategorized
        categoryMap.set('Uncategorized', []);

        // Distribute products to categories
        products.forEach((product: Product) => {
          const category = product.category || 'Uncategorized';
          if (!categoryMap.has(category)) {
            categoryMap.set(category, []);
          }
          categoryMap.get(category)?.push(product);
        });

        // Convert the map to categories array
        const newCategories = Array.from(categoryMap.entries()).map(([name, products]) => ({
          id: name.toLowerCase().replace(/\s+/g, '-'),
          name,
          products
        }));

        setCategories(newCategories);
        console.log('Fetched categories:', newCategories);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Expose method to add product to uncategorized column
  useImperativeHandle(ref, () => ({
    addProductToUncategorized(product: Product) {
      const uncategorizedCategory = categories.find(cat => cat.id === 'uncategorized');
      if (uncategorizedCategory) {
        // Check if product already exists to avoid duplicates
        const productExists = uncategorizedCategory.products.some(p => p.name === product.name);
        if (!productExists) {
          // Optimistic Update: Add product to uncategorized column
          const optimisticProduct = { ...product };
          uncategorizedCategory.products.push(optimisticProduct);
          setCategories([...categories]);
    
          // Create product and sync with database
          createProduct(product)
            .then((createdProduct) => {
              // Update categories with the database-generated product
              setCategories(prevCategories => 
                prevCategories.map(cat => {
                  if (cat.id === 'uncategorized') {
                    return {
                      ...cat,
                      products: cat.products.map(p => 
                        p === optimisticProduct ? createdProduct : p
                      )
                    };
                  }
                  return cat;
                })
              );
              console.log('Product created:', createdProduct);
            })
            .catch((error) => {
              console.error('Failed to create product:', error);
              
              // Rollback: Remove the product if creation fails
              setCategories(prevCategories => 
                prevCategories.map(cat => 
                  cat.id === 'uncategorized'
                    ? { ...cat, products: cat.products.filter(p => p !== optimisticProduct) }
                    : cat
                )
              );
            });
        }
      }
    }
  }));

  // Rest of the component remains the same as in the previous implementation...
  // (Drag and drop handler, add category, delete category methods)

  const onDragEnd = (result: DropResult) => {
    console.log('Drag End:', result);
    const { source, destination, draggableId } = result;

    // If dropped outside a droppable area
    if (!destination) {
      console.log('Dropped outside a droppable area');
      return;
    }

    // If dropped in the same location
    if ( source.droppableId === destination.droppableId && source.index === destination.index) {
      console.log('Dropped in the same location');
      return;
    }

    // Create a deep copy of categories for immutable update
    const newCategories = categories.map(category => ({
      ...category,
      products: [...category.products]
    }));

    // Find source and destination category
    const sourceCategory = newCategories.find(cat => cat.id === source.droppableId);
    const destCategory = newCategories.find(cat => cat.id === destination.droppableId);

    if (!sourceCategory || !destCategory) {
      console.log('Source or destination category not found');
      return;
    }

    // Store the original state for potential rollback
    const originalCategories = categories;

    // Remove product from source category
    const [movedProduct] = sourceCategory.products.splice(source.index, 1);

    // Add product to destination category
    destCategory.products.splice(destination.index, 0, movedProduct);

    // Update state
    setCategories(newCategories);
    console.log('Categories updated:', newCategories);
    console.log(`Moved product: ${movedProduct._id} Destination category: ${destCategory.name}`);

    try {
      updateProductCategory(movedProduct._id, destCategory.name)
        .catch((error) => {
          console.error('Failed to update product category:', error);
          
          // Rollback to previous state if update fails
          setCategories(originalCategories);
        });
    } catch (error) {
      console.error('Error calling updateProductCategory:', error);
      
      // Rollback to previous state if there's an error
      setCategories(originalCategories);
    }
  };

  // Add new category handler
  const addNewCategory = () => {
    if (!newCategoryName.trim()) return;

    const newCategory: Category = {
      id: `category-${Date.now()}`,
      name: newCategoryName,
      products: []
    };

    setCategories([...categories, newCategory]);
    setNewCategoryName('');
  };

  // Delete category handler
  const deleteCategory = (categoryId: string) => {
    // Prevent deleting Uncategorized category
    if (categoryId === 'uncategorized') return;

    setCategories(categories.filter(cat => cat.id !== categoryId));
  };

  return (
    <div className="p-4 max-w-full overflow-x-auto">
      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <div>
          <div className="mb-4 flex items-center space-x-2">
            <input
              type="text"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="New Category Name"
              className="flex-grow p-2 border rounded text-gray-800"
            />
            <button 
              onClick={addNewCategory}
              className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 flex items-center"
            >
              <Plus className="mr-2" /> Add Category
            </button>
          </div>

          <DragDropContext onDragEnd={onDragEnd}>
            <div className="flex space-x-4 overflow-x-auto pb-4">
              {categories.map((category) => (
                <div 
                  key={category.id} 
                  className="flex flex-col min-w-[300px] bg-gray-100 rounded-lg p-3 shadow-md"
                >
                  <div className="flex justify-between items-center mb-3">
                    <h2 className="text-lg font-semibold text-gray-600">{category.name}</h2>
                    {category.id !== 'uncategorized' && (
                      <button 
                        onClick={() => deleteCategory(category.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 size={20} />
                      </button>
                    )}
                  </div>

                  <Droppable droppableId={category.id}>
                    {(provided) => (
                      <div
                      key={category.id}
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className="flex-1 min-h-[100px] space-y-2 bg-gray-50 p-2 rounded-md"
                      >
                        {category.products.map((product, index) => (
                          <Draggable 
                            key={product._id || `temp-${product.barcode}`} 
                            draggableId={product._id || `temp-${product.barcode}`} 
                            index={index}
                          >
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`bg-white p-3 rounded shadow-sm 
                                  ${snapshot.isDragging ? 'shadow-lg ring-2 ring-blue-400' : ''}
                                  hover:bg-gray-50 text-gray-600 transition cursor-grab active:cursor-grabbing`}
                              >
                                {product.name}
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </div>
              ))}
            </div>
          </DragDropContext>
        </div>
      )}
    </div>
  );
});

KanbanBoard.displayName = 'KanbanBoard';

export default KanbanBoard;