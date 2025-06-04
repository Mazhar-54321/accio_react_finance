// src/components/AddIncomeDialog.jsx
import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  MenuItem
} from "@mui/material";

const categories = ["Salary", "Freelance", "Gift", "Other"];
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../config/firebase";
import { auth } from "../config/firebase";
import { getDocs, query, orderBy } from "firebase/firestore";


const AddIncomeExpenseDialog = ({ open, onClose,type,categories }) => {
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Salary");
  const [note, setNote] = useState("");
  const [state,setState]=useState({})

  const addTransaction = async ({ type, amount, category, note }) => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("Not logged in");
  
      const docRef = await addDoc(
        collection(db, "users", user.uid, "transactions"),
        {
          type,
          amount: Number(amount),
          category,
          note,
          timestamp: serverTimestamp()
        }
      );
  
      console.log("Transaction added with ID:", docRef.id);
    } catch (error) {
      console.error("Error adding transaction:", error.message);
    }
  };
  const handleSubmit = async () => {
    if (!amount) return;
    await addTransaction({
      type: "income",
      amount,
      category,
      note
    });
    // Clear form and close dialog
    setAmount("");
    setCategory("Salary");
    setNote("");
    onClose();
  };
  useEffect(()=>{
   console.log(fetchTransactions());
  },[])
  const fetchTransactions = async () => {
    const user = auth.currentUser;
    if (!user) {
      throw new Error("User not authenticated");
    }
  
    const transactionsRef = collection(db, "users", user.uid, "transactions");
    const q = query(transactionsRef, orderBy("timestamp", "desc"));
    const snapshot = await getDocs(q);
  
    const transactions = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    console.log(transactions);
    let totalIncome=0,totalExpense=0;
    for(let i =0;i<transactions.length;i++){
       if(transactions[i].type==="income"){
        totalIncome += transactions[i].amount;
       }else{
        totalExpense += transactions[i].amount;
       }
    }
    setState((prev)=>({
        ...prev,
        totalIncome:totalIncome,
        totalExpense:totalExpense
    }))
    return transactions;
  };
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Add Income</DialogTitle>
      <DialogContent>
        <TextField
          fullWidth
          label="Amount"
          type="text"
          margin="normal"
          
          value={amount}
          onChange={e => setAmount(e.target.value)}
        />
        <TextField
          fullWidth
          select
          label="Category"
          margin="normal"
          value={category}
          onChange={e => setCategory(e.target.value)}
        >
          {categories.map(cat => (
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
          onChange={e => setNote(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSubmit}>
          Add Income
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddIncomeExpenseDialog;
