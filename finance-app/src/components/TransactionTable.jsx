import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  TableSortLabel,
  Typography,
  Box,
  TextField,
  InputLabel,
  MenuItem,
  FormControl,
  Select,
  Button,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import IconButton from "@mui/material/IconButton";

const headCells = [
  { id: "type", label: "Type" },
  { id: "amount", label: "Amount" },
  { id: "category", label: "Category" },
  { id: "note", label: "Name" },
  { id: "timestamp", label: "Date" },
  { id: "action", label: "Action" },
];

const descendingComparator = (a, b, orderBy) => {
  if (orderBy === "timestamp") {
    return b[orderBy]?.toDate() - a[orderBy]?.toDate();
  }
  if (b[orderBy] < a[orderBy]) return -1;
  if (b[orderBy] > a[orderBy]) return 1;
  return 0;
};

const getComparator = (order, orderBy) => {
  return order === "desc"
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
};

const stableSort = (array, comparator) => {
  const stabilized = array.map((el, index) => [el, index]);
  stabilized.sort((a, b) => {
    const comp = comparator(a[0], b[0]);
    if (comp !== 0) return comp;
    return a[1] - b[1];
  });
  return stabilized.map((el) => el[0]);
};

const TransactionTable = ({ transactions = [] }) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [order, setOrder] = useState("desc");
  const [orderBy, setOrderBy] = useState("timestamp");
  const [type, setType] = React.useState("all");
  const [inputText, setInputText] = useState("");

  const handleChange = (event) => {
    setType(event.target.value);
  };

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const handleChangePage = (_, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value));
    setPage(0);
  };

  const sortedRows = stableSort(
    transactions?.filter(
      (el) =>
        el?.note
          ?.trim()
          ?.toLowerCase()
          ?.includes(inputText?.trim()?.toLowerCase()) &&
        (el?.type === type || type === "all")
    ),
    getComparator(order, orderBy)
  );
  const paginatedRows = sortedRows.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );
  const handleEdit = ()=>{

  }
  const handleDelete = ()=>{

  }
  return (
    <Paper sx={{ mt: 4 }}>
      <Typography variant="h6" sx={{ p: 2 }}>
        Transaction History
      </Typography>
      <Box
        component="form"
        sx={{ "& > :not(style)": { m: 1, width: "90%", display: "flex" } }}
        className="transaction-filters"
        style={{ display: "flex" }}
        noValidate
        autoComplete="off"
      >
        <TextField
          value={inputText}
          onChange={(event) => setInputText(event.target.value)}
          size="small"
          id="outlined-basic"
          label="Search by Name"
          variant="outlined"
        />

        <FormControl size="small">
          <InputLabel size="small" id="demo-simple-select-label">
            Select
          </InputLabel>
          <Select
            labelId="demo-simple-select-label"
            id="demo-simple-select"
            value={type}
            size="small"
            label="Age"
            onChange={handleChange}
          >
            <MenuItem value={"all"}>All</MenuItem>
            <MenuItem value={"income"}>Income</MenuItem>
            <MenuItem value={"expense"}>Expense</MenuItem>
          </Select>
        </FormControl>

        <Button variant="outlined">Export to CSV</Button>

        <Button variant="contained">Import from CSV</Button>
      </Box>
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow style={{ backgroundColor: "#ccc" }}>
              {headCells.map((headCell) => (
                <TableCell
                  key={headCell.id}
                  sortDirection={orderBy === headCell.id ? order : false}
                >
                  {headCell?.label !== "Action" && (
                    <TableSortLabel
                      active={orderBy === headCell.id}
                      direction={orderBy === headCell.id ? order : "asc"}
                      onClick={() => handleRequestSort(headCell.id)}
                    >
                      {headCell.label}
                    </TableSortLabel>
                  )}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedRows.map((row) => (
              <TableRow key={row.id}>
                <TableCell sx={{ textTransform: "capitalize" }}>
                  {row.type}
                </TableCell>
                <TableCell>₹{row.amount}</TableCell>
                <TableCell>{row.category}</TableCell>
                <TableCell>{row.note}</TableCell>
                <TableCell>
                  {row.timestamp?.toDate
                    ? row.timestamp.toDate().toLocaleDateString()
                    : "-"}
                </TableCell>
                <TableCell>
                  <IconButton onClick={() => handleEdit(row)}>
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(row.id)}>
                    <DeleteIcon fontSize="small" color="error" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {paginatedRows.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  No transactions found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        component="div"
        count={
          transactions?.filter(
            (el) =>
              el?.note
                ?.trim()
                ?.toLowerCase()
                ?.includes(inputText?.trim()?.toLowerCase()) &&
              (el?.type === type || type === "all")
          ).length
        }
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[5, 10, 25]}
      />
    </Paper>
  );
};

export default TransactionTable;
