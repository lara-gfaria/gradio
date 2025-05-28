import type { CellCoordinate } from "../types";
import { get_range_selection } from "../selection_utils";

export type DragState = {
	is_dragging: boolean;
	drag_start: CellCoordinate | null;
	mouse_down_pos: { x: number; y: number } | null;
	new_width: number;
};

export type DragHandlers = {
	handle_mouse_down: (event: MouseEvent, row: number, col: number) => void;
	handle_mouse_move: (event: MouseEvent) => void;
	handle_mouse_up: (event: MouseEvent) => void;
};

export function create_drag_handlers(
	state: DragState,
	set_is_dragging: (value: boolean) => void,
	set_selected_cells: (cells: CellCoordinate[]) => void,
	set_selected: (cell: CellCoordinate | false) => void,
	set_columns_width: (col: number, width: string) => void,
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

		if (row == -1) {
			const target = event.target as HTMLElement;
			const parent = target.parentElement;

			if (parent) {
				state.new_width = parent.clientWidth;
			}
		}

		state.mouse_down_pos = { x: event.clientX, y: event.clientY };
		state.drag_start = [row, col];

		if (!event.shiftKey && !event.metaKey && !event.ctrlKey && row !== -1) {
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
		if (!state.is_dragging && state.drag_start && state.drag_start[0] !== -1) {
			handle_cell_click(event, state.drag_start[0], state.drag_start[1]);
		} else if (
			state.is_dragging &&
			parent_element &&
			state.drag_start &&
			state.drag_start[0] !== -1
		) {
			parent_element.focus();
		}

		state.is_dragging = false;
		set_is_dragging(false);
		state.drag_start = null;
		state.mouse_down_pos = null;
		state.new_width = 0;
	};

	return {
		handle_mouse_down: start_drag,

		handle_mouse_move(event: MouseEvent): void {
			if (!state.drag_start || !state.mouse_down_pos) return;

			const dx = event.clientX - state.mouse_down_pos.x;
			const dy = event.clientY - state.mouse_down_pos.y;

			if (!state.is_dragging && (Math.abs(dx) > 3 || Math.abs(dy) > 3)) {
				state.is_dragging = true;
				set_is_dragging(true);
			}
			if (state.is_dragging && state.drag_start[0] !== -1) {
				update_selection(event);
			}

			if (state.is_dragging && state.drag_start[0] === -1) {
				state.new_width += dx;

				if (state.new_width < 100) {
					state.new_width = 100;
				}

				state.mouse_down_pos.x = event.clientX;

				set_columns_width(state.drag_start[1], `${state.new_width}px`);
			}
		},

		handle_mouse_up: end_drag
	};
}
