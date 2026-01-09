import express from "express";

const app = express();
app.use(express.json());
const PORT = 3000;

const list = [
    {
        id: 1,
        title: "Assignments",
        status: "Pending"
    },
    {
        id: 2,
        title: "Daily Chores",
        status: "Pending"
    }
]
const items = [
    {
        id: 1,
        listId: 1,
        description: "Programming",
        status: "Pending"
    },
    {
        id: 2,
        listId: 1,
        description: "Web Dev",
        status: "Pending"
    },
    {
        id: 3,
        listId: 2,
        description: "Wash Dish",
        status: "Pending"
    },
    {
        id: 4,
        listId: 2,
        description: "Clean the Room",
        status: "Pending"
    }
]

app.get("/get-list", (req, res) => {
    res.status(200).json({
        success: true,
        data: list
    });
});
app.get("/get-items/:id", (req, res) => {
    const listId = parseInt(req.params.id);

    const filtered = items.filter(item => item.listId === listId);

    if (filtered.length === 0) {
        return res.status(200).json({
            success: false,
            message: "No items found for the given list ID"
        });
    }
    res.status(200).json({
        success: true,
        items: filtered
    });
});
app.post('/add-list', (req, res) => {
    const { listTitle } = req.body;
    list.push({
        id:3,
        id: list.length + 1,
        title: listTitle,
        status: "Pending"
    });
    res.status(200).json({
        success: true,
        list,
        message: "List added successfully"
    });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});