import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  MenuItem,
} from "@mui/material";

import {
  collection,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db, auth } from "../config/firebase";

const AddIncomeExpenseDialog = ({ open, onClose, type, categories }) => {
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [note, setNote] = useState("");
  const [date, setDate] = useState("");
  const [errors, setErrors] = useState({
    amount: "",
    category: "",
    note: "",
    date: "",
  });

  useEffect(() => {
    if (open) {
      setAmount("");
      setCategory("");
      setNote("");
      setDate("");
      setErrors({ amount: "", category: "", note: "", date: "" });
    }
  }, [open]);

  const addTransaction = async ({ type, amount, category, note, date }) => {
    const user = auth.currentUser;
    if (!user) throw new Error("Not logged in");

    await addDoc(collection(db, "users", user.uid, "transactions"), {
      type,
      amount: Number(amount),
      category,
      note,
      timestamp: date ? new Date(date) : serverTimestamp(),
    });
  };

  const handleSubmit = async () => {
    const newErrors = { amount: "", category: "", note: "", date: "" };

    if (!amount || isNaN(Number(amount))) {
      newErrors.amount = "Amount must be a valid number";
    }
    if (!category) {
      newErrors.category = "Please select a category";
    }
    if (!note.trim()) {
      newErrors.note = "Note cannot be empty";
    }
    if (!date) {
      newErrors.date = "Please select a date";
    }

    if (newErrors.amount || newErrors.category || newErrors.note || newErrors.date) {
      setErrors(newErrors);
      return;
    }

    try {
      await addTransaction({ type, amount, category, note, date });
      onClose(type, true);
    } catch (err) {
      console.error("Error adding transaction:", err.message);
    }
  };

  return (
    <Dialog open={open} onClose={() => onClose(type, false)}>
      <DialogTitle>{type === "income" ? "Add Income" : "Add Expense"}</DialogTitle>
      <DialogContent>
        <TextField
          fullWidth
          label="Amount"
          type="text"
          margin="normal"
          value={amount}
          onChange={(e) => {
            setAmount(e.target.value);
            if (errors.amount && e.target.value && !isNaN(Number(e.target.value))) {
              setErrors((prev) => ({ ...prev, amount: "" }));
            }
          }}
          error={!!errors.amount}
          helperText={errors.amount}
        />
        <TextField
          fullWidth
          select
          label="Category"
          margin="normal"
          value={category}
          onChange={(e) => {
            setCategory(e.target.value);
            if (errors.category && e.target.value) {
              setErrors((prev) => ({ ...prev, category: "" }));
            }
          }}
          error={!!errors.category}
          helperText={errors.category}
        >
          {categories?.map((cat) => (
            <MenuItem key={cat} value={cat}>
              {cat}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          fullWidth
          label="Note"
          margin="normal"
          value={note}
          onChange={(e) => {
            setNote(e.target.value);
            if (errors.note && e.target.value.trim()) {
              setErrors((prev) => ({ ...prev, note: "" }));
            }
          }}
          error={!!errors.note}
          helperText={errors.note}
        />
        <TextField
          fullWidth
          label="Date"
          type="date"
          margin="normal"
          value={date}
          onChange={(e) => {
            setDate(e.target.value);
            if (errors.date && e.target.value) {
              setErrors((prev) => ({ ...prev, date: "" }));
            }
          }}
          InputLabelProps={{ shrink: true }}
          error={!!errors.date}
          helperText={errors.date}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={() => onClose(type, false)}>Cancel</Button>
        <Button variant="contained" onClick={handleSubmit}>
          {type === "income" ? "Add Income" : "Add Expense"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddIncomeExpenseDialog;
