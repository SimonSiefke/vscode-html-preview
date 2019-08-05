export function createTextNode(text: string): Text {
	return document.createTextNode(text);
}

export function createComment(text: string): Comment {
	return document.createComment(text);
}

export function insertBefore(
	parentNode: Node,
	newNode: Node,
	referenceNode: Node
): void {
	parentNode.insertBefore(newNode, referenceNode);
}

export function removeChild(node: Node, child: Node): void {
	node.removeChild(child);
}

export function appendChild(node: Node, child: Node): void {
	node.appendChild(child);
}

export function parentNode(node: Node): Node | null {
	return node.parentNode;
}

export function nextSibling(node: Node): Node | null {
	return node.nextSibling;
}

export function setTextContent(node: Node, text: string): void {
	node.textContent = text;
}
