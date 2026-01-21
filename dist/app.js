import express from 'express';
const app = express();
const port = 3000;
app.get('/', (req, res) => {
    res.send(`Hello from Jenil's Node.js + TS DevOps Project! 🚀`);
});
if (process.env.NODE_ENV !== 'test') {
    app.listen(port, () => {
        console.log(`Server running at http://localhost:${port}`);
    });
}
export default app;
//# sourceMappingURL=app.js.map