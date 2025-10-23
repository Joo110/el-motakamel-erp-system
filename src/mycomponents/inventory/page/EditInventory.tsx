// src/mycomponents/inventory/page/EditInventory.tsx
import React from "react";
import { useParams } from "react-router-dom";
import EditInventoryForm from "@/mycomponents/inventory/page/EditInventoryForm";

const EditInventory: React.FC = () => {
  const params = useParams<{ id?: string }>();
  const id = params.id;

  if (!id) {
    return (
      <div className="p-6 text-red-600">
        Inventory ID is missing in the URL.
      </div>
    );
  }

  return <EditInventoryForm inventoryId={id} />;
};

export default EditInventory;