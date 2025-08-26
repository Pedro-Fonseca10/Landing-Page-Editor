import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import Login from "../pages/Login";

test("renderiza o botão Entrar", () => {
  render(<Login />);
  expect(screen.getByText("Entrar")).toBeInTheDocument();
});
