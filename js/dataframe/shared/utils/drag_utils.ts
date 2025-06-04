import type { CellCoordinate} from "../types";
import { get_range_selection } from "../selection_utils";


export type DragState = {
	is_dragging: boolean;
	drag_start: CellCoordinate | null;
	column_drag_start: number | null;
	mouse_down_pos: { x: number; y: number } | null;
};

export type DragHandlers = {
	handle_mouse_down: (event: MouseEvent, row: number, col: number) => void;
	handle_mouse_move: (event: MouseEvent) => void;
	handle_mouse_up: (event: MouseEvent) => void;
};

export type ColumnDragHandlers = {
	handle_mouse_down_column: (event: MouseEvent, row: number, col: number) => void;
	handle_mouse_move_column: (event: MouseEvent) => void;
	handle_mouse_up_column: (event: MouseEvent) => void; 
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
	handle_column_click: (event: MouseEvent, col: number) => void,
	show_row_numbers: boolean,
	parent_element?: HTMLElement //Não sei o que isto é ainda
): ColumnDragHandlers {
	const start_column_drag = (event: MouseEvent, col: number): void => {

		if (
			event.target instanceof HTMLAnchorElement ||
			(show_row_numbers && col === -1)
		)
			return;

		event.preventDefault();
		event.stopPropagation();

		state.mouse_down_pos = { x: event.clientX, y: event.clientY };
		state.column_drag_start = col;

		if (!event.shiftKey && !event.metaKey && !event.ctrlKey) {
			handle_column_click(event, col);
		}
		
	};

	const update_column_selection = (event: MouseEvent): void => {

		//O meu racional é que no update_selection anterior eles davam update das cell coordinates da nova range
		//Neste caso acho que o que acontece aqui é que queremos arrastar outra coluna, portanto vemos em que célula 
		//Estamos a fazer o arraste e depois retornamos essa nova coluna para depois ser arrastada.
		//Mas será que isto faz sentido aqui?
		//Porque no outro drag tu podes, no mesmo drag, ir selecionando cada vez mais ou menos células
		//Mas no nosso drag tu para selecionares outra coluna tens que largar a coluna que estás a dar resizing
		//E depois escolher outra coluna. Portanto acho que maybe não precisamos do update_column_selection, porque 
		//Isso seria resolvido com uma nova instância de um column_drag
		//Diz se achas que mantemos ou removemos isto por whatsapp quando puderes :)
		
		const cell = (event.target as HTMLElement).closest("td");
		if (!cell) return;

		const col = parseInt(cell.getAttribute("data-col") || "0");

		if (isNaN(col)) return;

	
	};

	const end_column_drag = (event: MouseEvent): void => {

		if (!state.is_dragging && state.column_drag_start) {
			handle_column_click(event, state.column_drag_start);
		} else if (state.is_dragging && parent_element) {
			parent_element.focus();
		}

		state.is_dragging = false;
		set_is_dragging(false);
		state.column_drag_start = null;
		state.mouse_down_pos = null;
	};

	return {

		handle_mouse_down_column: start_column_drag, 
		handle_mouse_move_column(event: MouseEvent): void {

			if (!state.drag_start || !state.mouse_down_pos) return;

			const dx = Math.abs(event.clientX - state.mouse_down_pos.x);
			const dy = Math.abs(event.clientY - state.mouse_down_pos.y);

			//Aqui acho que faz sentido ds e dy serem superior a 0 em vez de 3, porque o caso de 3 era que 
			//no drag anterior quando fazias um drag significativo aquilo selecionava a célula, mas aqui queremos que
			//o drag acompanhe sempre o movimento.
			if (!state.is_dragging && (dx > 0 || dy > 0)) {
				state.is_dragging = true;
				set_is_dragging(true);

				//Será que é aqui que quando detetamos o movimento drag ajustamos o column width?
				//Não sei bem ainda em que função é que vamos mesmo ajustar esse parâmetro
				//Btw, column_widths é um parâmetro no dataframe context column_widths: string[];
				//Provavelmente vamos ter que mexer nisso
			}


			if (state.is_dragging) {
				update_column_selection(event);
			}


			
		},

		handle_mouse_up_column: end_column_drag
	};
}