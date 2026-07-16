"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { api } from "@/lib/api";
import { Loader2 } from "lucide-react";

export default function DriverExpensesPage() {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        const data = await api.get('/driver/expenses');
        setExpenses(data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchExpenses();
  }, []);

  if (isLoading) {
    return <div className="flex h-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6 animate-in fade-in-50">
      <h1 className="text-3xl font-bold tracking-tight">Fuel & Expenses</h1>
      <div className="grid gap-4 md:grid-cols-2">
        {expenses.length === 0 ? (
          <p className="text-muted-foreground">No expenses found.</p>
        ) : (
          expenses.map(exp => (
            <Card key={exp.id}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">${exp.amount.toFixed(2)}</CardTitle>
                  <span className="text-xs font-medium px-2 py-1 bg-muted rounded-md">{exp.type}</span>
                </div>
                <CardDescription>{new Date(exp.date).toLocaleString()}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-sm mt-2">
                  <p><span className="font-medium">Station:</span> {exp.station || 'N/A'}</p>
                  {exp.notes && <p className="text-muted-foreground mt-1 text-xs">{exp.notes}</p>}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
