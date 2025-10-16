import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Product {
  id: number;
  name: string;
  price: number;
}

const Products = () => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setProducts([
        { id: 1, name: "Laptop", price: 1200 },
        { id: 2, name: "Phone", price: 800 },
        { id: 3, name: "Keyboard", price: 120 },
      ]);
    }, 800);
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Products</h1>

      <div className="grid gap-4">
        {products.map((p) => (
          <Card key={p.id} className="shadow-md border rounded-2xl">
            <CardContent className="flex justify-between items-center p-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-700">{p.name}</h2>
                <p className="text-gray-500">${p.price}</p>
              </div>
              <Button variant="outline">Edit</Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Products;