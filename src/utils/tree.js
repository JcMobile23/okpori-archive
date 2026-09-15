export const flattenTree = (node, acc = []) => {
  acc.push({ id: node.id, name: node.name, ...node });
  if (node.children) {
    node.children.forEach((child) => flattenTree(child, acc));
  }
  return acc;
};

export const findPerson = (node, id) => {
  if (!node) return null;
  if (node.id === id) return node;
  if (node.children) {
    for (const child of node.children) {
      const found = findPerson(child, id);
      if (found) return found;
    }
  }
  return null;
};

export const updateRecursive = (node, updatedPerson) => {
  if (node.id === updatedPerson.id) {
    return { ...node, ...updatedPerson };
  }
  if (node.children) {
    return { ...node, children: node.children.map((c) => updateRecursive(c, updatedPerson)) };
  }
  return node;
};

export const validateLineageShape = (lineage) => {
  if (!lineage || typeof lineage !== 'object') return false;
  if (typeof lineage.name !== 'string' || typeof lineage.id !== 'string') return false;
  if (lineage.children !== undefined && !Array.isArray(lineage.children)) return false;
  if (Array.isArray(lineage.children)) {
    return lineage.children.every(validateLineageShape);
  }
  return true;
};
