"use client";

import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Plus, Trash2 } from 'lucide-react';

// Define the product type
interface Product {
  id: string;
  name: string;
}

// Define the category type
interface Category {
  id: string;
  name: string;
  products: Product[];
}

const KanbanBoard: React.FC = () => {
  // Initial state with Uncategorized category
  const [categories, setCategories] = useState<Category[]>([
    {
      id: 'uncategorized',
      name: 'Uncategorized',
      products: [
        { id: 'prod1', name: 'Laptop' },
        { id: 'prod2', name: 'Smartphone' },
      ]
    }
  ]);

  // State for new category input
  const [newCategoryName, setNewCategoryName] = useState('');

  // Drag and drop handler
  const onDragEnd = (result: DropResult) => {
    console.log('Drag End:', result);
    const { source, destination } = result;

    // If dropped outside a droppable area
    if (!destination) {
      console.log('Dropped outside a droppable area');
      return;
    }

    // If dropped in the same location
    if (
      source.droppableId === destination.droppableId && 
      source.index === destination.index
    ) {
      console.log('Dropped in the same location');
      return;
    }

    // Create a copy of categories for immutable update
    const newCategories = [...categories];

    // Find source and destination category
    const sourceCategory = newCategories.find(cat => cat.id === source.droppableId);
    const destCategory = newCategories.find(cat => cat.id === destination.droppableId);

    if (!sourceCategory || !destCategory) {
      console.log('Source or destination category not found');
      return;
    }

    // Remove product from source category
    const [movedProduct] = sourceCategory.products.splice(source.index, 1);

    // Add product to destination category
    destCategory.products.splice(destination.index, 0, movedProduct);

    // Update state
    setCategories(newCategories);
    console.log('Categories updated:', newCategories);
  };

  const addNewProduct = () => {
    
  }

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
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="flex-1 min-h-[100px] space-y-2 bg-gray-50 p-2 rounded-md"
                  >
                    {category.products.map((product, index) => (
                      <Draggable 
                        key={product.id} 
                        draggableId={product.id} 
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
  );
};

export default KanbanBoard;