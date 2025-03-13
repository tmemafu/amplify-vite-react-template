import { useEffect, useState } from "react";
import type { Schema } from "../amplify/data/resource";
import { useAuthenticator } from '@aws-amplify/ui-react';
import { generateClient } from "aws-amplify/data";

const client = generateClient<Schema>();

function App() {
  const [todos, setTodos] = useState<Array<Schema["Todo"]["type"]>>([]);
  const { signOut } = useAuthenticator();

  useEffect(() => {
    const subscription = client.models.Todo.observeQuery().subscribe({
      next: (data) => setTodos([...data.items]),
    });

    return () => subscription.unsubscribe(); // Cleanup subscription
  }, []);

  async function createTodo() {
    const content = window.prompt("Enter new todo:");
    if (content) {
      await client.models.Todo.create({ content });
    }
  }
    
  async function deleteTodo(id: string) {
    await client.models.Todo.delete({ id });
  }

  return (
    <main>
      <h1>My Todos</h1>
      <button onClick={createTodo}>+ New</button>
      <ul>
        {todos.map((todo) => (
          <li key={todo.id} onClick={() => deleteTodo(todo.id)}>
            {todo.content}
          </li>
        ))}
      </ul>
      <div>
        🥳 App successfully hosted. Try creating a new todo.
        <br />
        <a href="https://docs.amplify.aws/react/start/quickstart/#make-frontend-updates">
          Review next step of this tutorial.
        </a>
        <br />
        <button onClick={signOut}>Sign out</button>
      </div>
    </main>
  );
}

export default App;
