import type { CellCoordinate } from "../types";
import { get_range_selection } from "../selection_utils";


export type DragState = {
	is_dragging: boolean;
	drag_start: CellCoordinate | null;
	mouse_down_pos: { x: number; y: number } | null;
};

export type DragHandlers = {
	handle_mouse_down: (event: MouseEvent, row: number, col: number) => void;
	handle_mouse_move: (event: MouseEvent) => void;
	handle_mouse_up: (event: MouseEvent) => void;
};


//Os nossos handlers, aqui o nosso movimento pode começar tanto como um drag para a direita ou para a esquerda
export type ColumnDragHandlers = {
	handle_mouse_left: (event: MouseEvent, row: number, col: number) => void;
	handle_mouse_right: (event: MouseEvent, row: number, col: number) => void;
	handle_mouse_column_move: (event: MouseEvent) => void;
	handle_mouse_stop: (event: MouseEvent) => void; //Meio na dúvida com este
}


export function create_drag_handlers(
	state: DragState,
	set_is_dragging: (value: boolean) => void,
	set_selected_cells: (cells: CellCoordinate[]) => void,
	set_selected: (cell: CellCoordinate | false) => void,
	handle_cell_click: (event: MouseEvent, row: number, col: number) => void,
	show_row_numbers: boolean,
	parent_element?: HTMLElement
): DragHandlers {
	const start_drag = (event: MouseEvent, row: number, col: number): void => {
		if (
			event.target instanceof HTMLAnchorElement ||
			(show_row_numbers && col === -1)
		)
			return;

		event.preventDefault();
		event.stopPropagation();

		state.mouse_down_pos = { x: event.clientX, y: event.clientY };
		state.drag_start = [row, col];

		if (!event.shiftKey && !event.metaKey && !event.ctrlKey) {
			set_selected_cells([[row, col]]);
			set_selected([row, col]);
			handle_cell_click(event, row, col);
		}
	};

	const update_selection = (event: MouseEvent): void => {
		const cell = (event.target as HTMLElement).closest("td");
		if (!cell) return;

		const row = parseInt(cell.getAttribute("data-row") || "0");
		const col = parseInt(cell.getAttribute("data-col") || "0");

		if (isNaN(row) || isNaN(col)) return;

		const selection_range = get_range_selection(state.drag_start!, [row, col]);
		set_selected_cells(selection_range);
		set_selected([row, col]);
	};

	const end_drag = (event: MouseEvent): void => {
		if (!state.is_dragging && state.drag_start) {
			handle_cell_click(event, state.drag_start[0], state.drag_start[1]);
		} else if (state.is_dragging && parent_element) {
			parent_element.focus();
		}

		state.is_dragging = false;
		set_is_dragging(false);
		state.drag_start = null;
		state.mouse_down_pos = null;
	};

	return {
		handle_mouse_down: start_drag,

		handle_mouse_move(event: MouseEvent): void {
			if (!state.drag_start || !state.mouse_down_pos) return;

			const dx = Math.abs(event.clientX - state.mouse_down_pos.x);
			const dy = Math.abs(event.clientY - state.mouse_down_pos.y);

			if (!state.is_dragging && (dx > 3 || dy > 3)) {
				state.is_dragging = true;
				set_is_dragging(true);
			}

			if (state.is_dragging) {
				update_selection(event);
			}
		},

		handle_mouse_up: end_drag
	};
}

//Função que vai criar os nossos column drag handlers, acho melhor serem cenas separadas 
//Porque assim só estamos a adicionar uma funcionalidade de código em vez de estar a alterar a função acima
//O que iria causar bastantes problemas
export function create_column_drag_handlers(
	state: DragState,
	set_is_dragging: (value: boolean) => void,

	//Aqui acho que deviamos fazer set_selected_columns, set_selected e handle_column_line_click
	//Maybe tiramos o show_row_numbers?

	//set_selected_column: (column: number) => void,
	//set_selected: (cell: CellCoordinate | false) => void, O que fazer com este?
	handle_column_click: (event: MouseEvent, col: number) => void
	//show_row_numbers: boolean,
	//parent_element?: HTMLElement

): ColumnDragHandlers {
	const start_column_drag = (event: MouseEvent, col: number): void => {
		//TO DO
		/*
		if (
			event.target instanceof HTMLAnchorElement ||
			(show_row_numbers && col === -1)
		)
			return;

		event.preventDefault();
		event.stopPropagation();

		state.mouse_down_pos = { x: event.clientX, y: event.clientY };
		state.drag_start = [row, col];

		if (!event.shiftKey && !event.metaKey && !event.ctrlKey) {
			set_selected_cells([[row, col]]);
			set_selected([row, col]);
			handle_cell_click(event, row, col);
		}
		*/
	};

	const update_column_selection = (event: MouseEvent): void => {
		//TO DO, lembrar que estamos a selecionar colunas
		/*
		const cell = (event.target as HTMLElement).closest("td");
		if (!cell) return;

		const row = parseInt(cell.getAttribute("data-row") || "0");
		const col = parseInt(cell.getAttribute("data-col") || "0");

		if (isNaN(row) || isNaN(col)) return;

		const selection_range = get_range_selection(state.drag_start!, [row, col]);
		set_selected_cells(selection_range);
		set_selected([row, col]);
		*/
	};

	const end_column_drag = (event: MouseEvent): void => {
		//TO DO
		/*
		if (!state.is_dragging && state.drag_start) {
			handle_cell_click(event, state.drag_start[0], state.drag_start[1]);
		} else if (state.is_dragging && parent_element) {
			parent_element.focus();
		}

		state.is_dragging = false;
		set_is_dragging(false);
		state.drag_start = null;
		state.mouse_down_pos = null;
		*/
	};

	return {
		//Começamos o drag tanto para a esquerda como para a direita
		handle_mouse_left: start_column_drag, 
		handle_mouse_right: start_column_drag,


		handle_mouse_column_move(event: MouseEvent): void {

			/*
			if (!state.drag_start || !state.mouse_down_pos) return;

			const dx = Math.abs(event.clientX - state.mouse_down_pos.x);
			const dy = Math.abs(event.clientY - state.mouse_down_pos.y);

			if (!state.is_dragging && (dx > 3 || dy > 3)) {
				state.is_dragging = true;
				set_is_dragging(true);
			}

			if (state.is_dragging) {
				update_selection(event);
			}
			*/
		},

		handle_mouse_stop: end_column_drag
		//Será que deviamos por um handle_mouse_stop?
	};
}