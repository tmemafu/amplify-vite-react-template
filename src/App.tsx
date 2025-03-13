import { useEffect, useState } from "react";
import type { Schema } from "../amplify/data/resource";
import { useAuthenticator } from "@aws-amplify/ui-react";
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
    <div className="flex h-screen">
      {/* Sidebar - Fixed on the left */}
      <aside className="w-60 bg-gray-900 text-white flex flex-col items-start p-5 h-full fixed">
        <h2 className="text-xl font-bold mb-6">Menu</h2>
        <button className="w-full text-left py-2 px-3 hover:bg-gray-700 rounded">
          Settings
        </button>
        <button
          onClick={signOut}
          className="w-full text-left py-2 px-3 mt-auto bg-red-600 hover:bg-red-700 rounded"
        >
          Sign out
        </button>
      </aside>

      {/* Main Content Wrapper (Includes Navbar & Body) */}
      <div className="ml-60 flex-1 flex flex-col">
        {/* Navbar - Fixed Header (1440px width, 93px height) */}
        <header className="w-full max-w-[1440px] h-[93px] bg-gray-800 text-white p-4 flex justify-between items-center shadow-md fixed top-0 left-60">
          <h1 className="text-2xl font-bold">Todo App</h1>
          <div className="flex space-x-4">
            <button className="px-4 py-2 bg-gray-700 rounded hover:bg-gray-600">
              Profile
            </button>
            <button className="px-4 py-2 bg-gray-700 rounded hover:bg-gray-600">
              Settings
            </button>
          </div>
        </header>

        {/* Main Content (Push Down to Avoid Overlapping Navbar) */}
        <main className="p-5 mt-[93px]">
          <h1 className="text-2xl font-bold">My Todos</h1>
          <button
            onClick={createTodo}
            className="mt-3 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            + New
          </button>
          <ul className="mt-5">
            {todos.map((todo) => (
              <li
                key={todo.id}
                onClick={() => deleteTodo(todo.id)}
                className="p-3 bg-gray-100 my-2 cursor-pointer rounded hover:bg-gray-200"
              >
                {todo.content}
              </li>
            ))}
          </ul>
          <p className="mt-5 text-gray-600">Click on a task to delete it.</p>
        </main>
      </div>
    </div>
  );
}

export default App;
