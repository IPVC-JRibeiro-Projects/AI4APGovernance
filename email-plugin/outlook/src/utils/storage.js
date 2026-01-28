export function setIdImplementacao(id) {
  localStorage.setItem("id_implementacao", id);
}

export function getIdImplementacao() {
  return localStorage.getItem("id_implementacao");
}
