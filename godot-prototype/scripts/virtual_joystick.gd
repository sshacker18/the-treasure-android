class_name VirtualJoystick
extends Control

signal axis_changed(axis: Vector2)

var axis := Vector2.ZERO
var _touch_index := -1
var _mouse_down := false
const DEAD_ZONE := 0.16
const KNOB_LIMIT := 0.62

func _ready() -> void:
	custom_minimum_size = Vector2(150, 150)
	mouse_filter = Control.MOUSE_FILTER_STOP
	queue_redraw()

func _gui_input(event: InputEvent) -> void:
	if event is InputEventScreenTouch:
		if event.pressed and _touch_index == -1:
			_touch_index = event.index
			_set_from_position(event.position)
		elif not event.pressed and event.index == _touch_index:
			_touch_index = -1
			_set_axis(Vector2.ZERO)
		accept_event()
	elif event is InputEventScreenDrag and event.index == _touch_index:
		_set_from_position(event.position)
		accept_event()
	elif event is InputEventMouseButton and event.button_index == MOUSE_BUTTON_LEFT:
		_mouse_down = event.pressed
		if _mouse_down:
			_set_from_position(event.position)
		else:
			_set_axis(Vector2.ZERO)
		accept_event()
	elif event is InputEventMouseMotion and _mouse_down:
		_set_from_position(event.position)
		accept_event()

func _set_from_position(point: Vector2) -> void:
	var center := size * 0.5
	var radius := minf(size.x, size.y) * 0.36
	var delta := point - center
	if delta.length() > radius:
		delta = delta.normalized() * radius
	var next_axis := Vector2(delta.x / radius, delta.y / radius)
	if next_axis.length() < DEAD_ZONE:
		next_axis = Vector2.ZERO
	else:
		next_axis = next_axis.limit_length(1.0)
	_set_axis(next_axis)

func _set_axis(value: Vector2) -> void:
	if axis.is_equal_approx(value):
		return
	axis = value
	axis_changed.emit(axis)
	queue_redraw()

func _notification(what: int) -> void:
	if what == NOTIFICATION_WM_WINDOW_FOCUS_OUT:
		_touch_index = -1
		_mouse_down = false
		_set_axis(Vector2.ZERO)

func _draw() -> void:
	var center := size * 0.5
	var radius := minf(size.x, size.y) * 0.42
	draw_circle(center, radius, Color(0.05, 0.09, 0.08, 0.72))
	draw_arc(center, radius, 0.0, TAU, 64, Color(0.83, 0.69, 0.42, 0.95), 3.0, true)
	var knob_center := center + axis * radius * KNOB_LIMIT
	draw_circle(knob_center, radius * 0.36, Color(0.91, 0.72, 0.40, 0.96))
	draw_arc(knob_center, radius * 0.36, 0.0, TAU, 40, Color(1.0, 0.91, 0.66, 1.0), 2.0, true)
