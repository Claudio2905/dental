// Variables globales
const appointmentTable = document.getElementById("appointmentTable")
const appointmentTableBody = document.getElementById("appointmentTableBody")
const currentDateElement = document.getElementById("currentDate")
const searchInput = document.getElementById("searchInput")
const searchButton = document.getElementById("searchButton")
const prevDayButton = document.getElementById("prevDay")
const nextDayButton = document.getElementById("nextDay")
const addAppointmentButton = document.getElementById("addAppointment")

// URL base para la API
const API_BASE_URL = "/api/appointments"

// Fecha actual
let currentDate = new Date()
updateDateDisplay()

// Cargar citas para la fecha actual
loadAppointmentsByDate(formatDateForAPI(currentDate))

// Event listeners
prevDayButton.addEventListener("click", () => {
  currentDate.setDate(currentDate.getDate() - 1)
  updateDateDisplay()
  loadAppointmentsByDate(formatDateForAPI(currentDate))
})

nextDayButton.addEventListener("click", () => {
  currentDate.setDate(currentDate.getDate() + 1)
  updateDateDisplay()
  loadAppointmentsByDate(formatDateForAPI(currentDate))
})

// Modificar el event listener del currentDateElement para manejar correctamente la zona horaria
currentDateElement.addEventListener("click", () => {
  const datePicker = document.createElement("input")
  datePicker.type = "date"
  datePicker.style.position = "absolute"
  datePicker.style.left = currentDateElement.offsetLeft + "px"
  datePicker.style.top = currentDateElement.offsetTop + currentDateElement.offsetHeight + "px"

  datePicker.addEventListener("change", () => {
    if (datePicker.value) {
      // Crear la fecha correctamente para la zona horaria de Perú
      // El formato de datePicker.value es YYYY-MM-DD
      const [year, month, day] = datePicker.value.split("-").map(Number)

      // Crear una nueva fecha con los componentes de año, mes y día
      // Nota: en JavaScript, los meses van de 0 a 11, por eso restamos 1 al mes
      currentDate = new Date(year, month - 1, day)

      updateDateDisplay()
      loadAppointmentsByDate(datePicker.value) // Usar directamente el valor del datePicker
      document.body.removeChild(datePicker)
    }
  })

  document.body.appendChild(datePicker)
  datePicker.showPicker()
})

searchButton.addEventListener("click", () => {
  const dni = searchInput.value.trim()
  if (dni) {
    loadAppointmentsByDni(dni)
  } else {
    alert("Por favor ingrese un DNI para buscar")
  }
})

addAppointmentButton.addEventListener("click", () => {
  showAppointmentModal()
})

// Funciones
function updateDateDisplay() {
  const options = { weekday: "long", year: "numeric", month: "long", day: "numeric" }
  currentDateElement.textContent = currentDate.toLocaleDateString("es-ES", options)
}

// Modificar la función formatDateForAPI para manejar correctamente la zona horaria de Perú
function formatDateForAPI(date) {
  // Crear una copia de la fecha para no modificar la original
  const dateCopy = new Date(date)

  // Ajustar la fecha para la zona horaria de Perú (UTC-5)
  // Obtener la fecha en formato YYYY-MM-DD considerando la zona horaria local
  const year = dateCopy.getFullYear()
  const month = String(dateCopy.getMonth() + 1).padStart(2, "0")
  const day = String(dateCopy.getDate()).padStart(2, "0")

  return `${year}-${month}-${day}`
}

function formatTimeForDisplay(timeString) {
  return timeString.substring(0, 5)
}

async function loadAppointmentsByDate(date) {
  try {
    const response = await fetch(`${API_BASE_URL}/date/${date}`)
    if (!response.ok) {
      throw new Error("Error al cargar las citas")
    }
    const appointments = await response.json()
    renderAppointments(appointments)
  } catch (error) {
    console.error("Error:", error)
    alert("Error al cargar las citas")
  }
}

async function loadAppointmentsByDni(dni) {
  try {
    const response = await fetch(`${API_BASE_URL}/dni/${dni}`)
    if (!response.ok) {
      throw new Error("Error al buscar las citas")
    }
    const appointments = await response.json()
    renderAppointments(appointments)
  } catch (error) {
    console.error("Error:", error)
    alert("Error al buscar las citas")
  }
}

// Modificar la función renderAppointments para mostrar correctamente la fecha
function renderAppointments(appointments) {
  appointmentTableBody.innerHTML = ""

  if (appointments.length === 0) {
    const row = document.createElement("tr")
    row.innerHTML = `<td colspan="6" class="text-center">No hay citas para mostrar</td>`
    appointmentTableBody.appendChild(row)
    return
  }

  appointments.forEach((appointment) => {
    // Convertir la fecha de la cita a un objeto Date
    // Asegurarse de que la fecha se interprete correctamente
    const appointmentDate = new Date(appointment.appointmentDate + "T00:00:00-05:00")

    const row = document.createElement("tr")
    row.innerHTML = `
            <td>${appointment.name}</td>
            <td>${appointment.lastName || ""}</td>
            <td>${appointment.dni}</td>
            <td>${formatTimeForDisplay(appointment.appointmentTime)}</td>
            <td>${appointmentDate.toLocaleDateString("es-ES")}</td>
            <td>
                <button class="btn-edit" data-id="${appointment.id}">Modificar</button>
                <button class="btn-delete" data-id="${appointment.id}">Eliminar</button>
            </td>
        `
    appointmentTableBody.appendChild(row)
  })

  // Agregar event listeners a los botones de editar y eliminar
  document.querySelectorAll(".btn-edit").forEach((button) => {
    button.addEventListener("click", () => {
      const id = button.getAttribute("data-id")
      editAppointment(id)
    })
  })

  document.querySelectorAll(".btn-delete").forEach((button) => {
    button.addEventListener("click", () => {
      const id = button.getAttribute("data-id")
      deleteAppointment(id)
    })
  })
}

async function editAppointment(id) {
  try {
    const response = await fetch(`${API_BASE_URL}/${id}`)
    if (!response.ok) {
      throw new Error("Error al cargar la cita")
    }
    const appointment = await response.json()
    showAppointmentModal(appointment)
  } catch (error) {
    console.error("Error:", error)
    alert("Error al cargar la cita")
  }
}

function deleteAppointment(id) {
  const confirmDelete = confirm("¿Está seguro que desea eliminar esta cita?")
  if (confirmDelete) {
    fetch(`${API_BASE_URL}/${id}`, {
      method: "DELETE",
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Error al eliminar la cita")
        }
        // Recargar citas para la fecha actual
        loadAppointmentsByDate(formatDateForAPI(currentDate))
      })
      .catch((error) => {
        console.error("Error:", error)
        alert("Error al eliminar la cita")
      })
  }
}

function showAppointmentModal(appointment = null) {
  // Crear contenedor del modal
  const modalContainer = document.createElement("div")
  modalContainer.className = "modal-container"
  modalContainer.style.position = "fixed"
  modalContainer.style.top = "0"
  modalContainer.style.left = "0"
  modalContainer.style.width = "100%"
  modalContainer.style.height = "100%"
  modalContainer.style.backgroundColor = "rgba(0, 0, 0, 0.5)"
  modalContainer.style.display = "flex"
  modalContainer.style.justifyContent = "center"
  modalContainer.style.alignItems = "center"
  modalContainer.style.zIndex = "1000"

  // Crear contenido del modal
  const modalContent = document.createElement("div")
  modalContent.className = "modal-content"
  modalContent.style.backgroundColor = "white"
  modalContent.style.padding = "20px"
  modalContent.style.borderRadius = "5px"
  modalContent.style.width = "400px"

  // Establecer título del modal
  const modalTitle = document.createElement("h2")
  modalTitle.textContent = appointment ? "Modificar Cita" : "Agregar Cita"

  // Crear formulario
  const form = document.createElement("form")
  form.id = "appointmentForm"

  // Crear campos del formulario
  form.innerHTML = `
        <div class="form-group" style="margin-bottom: 15px;">
            <label for="name" style="display: block; margin-bottom: 5px;">Nombre*:</label>
            <input type="text" id="name" name="name" required value="${appointment ? appointment.name : ""}" style="width: 100%; padding: 8px; box-sizing: border-box;">
        </div>
        <div class="form-group" style="margin-bottom: 15px;">
            <label for="lastName" style="display: block; margin-bottom: 5px;">Apellido:</label>
            <input type="text" id="lastName" name="lastName" value="${appointment ? appointment.lastName || "" : ""}" style="width: 100%; padding: 8px; box-sizing: border-box;">
        </div>
        <div class="form-group" style="margin-bottom: 15px;">
            <label for="dni" style="display: block; margin-bottom: 5px;">DNI*:</label>
            <input type="text" id="dni" name="dni" required value="${appointment ? appointment.dni : ""}" style="width: 100%; padding: 8px; box-sizing: border-box;">
        </div>
        <div class="form-group" style="margin-bottom: 15px;">
            <label for="time" style="display: block; margin-bottom: 5px;">Hora*:</label>
            <input type="time" id="time" name="time" required value="${appointment ? appointment.appointmentTime : ""}" style="width: 100%; padding: 8px; box-sizing: border-box;">
        </div>
        <div class="form-group" style="margin-bottom: 15px;">
            <label for="date" style="display: block; margin-bottom: 5px;">Día*:</label>
            <input type="date" id="date" name="date" required value="${appointment ? appointment.appointmentDate : formatDateForAPI(currentDate)}" style="width: 100%; padding: 8px; box-sizing: border-box;">
        </div>
        <div class="form-actions" style="display: flex; justify-content: space-between; margin-top: 20px;">
            <button type="submit" class="btn-save" style="padding: 8px 15px; background-color: #4CAF50; color: white; border: none; border-radius: 4px; cursor: pointer;">Guardar</button>
            <button type="button" class="btn-cancel" style="padding: 8px 15px; background-color: #f44336; color: white; border: none; border-radius: 4px; cursor: pointer;">Cancelar</button>
        </div>
        ${appointment ? `<input type="hidden" id="appointmentId" value="${appointment.id}">` : ""}
    `

  // Agregar elementos al modal
  modalContent.appendChild(modalTitle)
  modalContent.appendChild(form)
  modalContainer.appendChild(modalContent)

  // Agregar modal al body
  document.body.appendChild(modalContainer)

  // Agregar event listeners
  form.addEventListener("submit", saveAppointment)

  document.querySelector(".btn-cancel").addEventListener("click", () => {
    document.body.removeChild(modalContainer)
  })
}

async function saveAppointment(event) {
  event.preventDefault()

  const form = event.target
  const appointmentId = form.querySelector("#appointmentId")?.value

  const appointmentData = {
    name: form.querySelector("#name").value,
    lastName: form.querySelector("#lastName").value,
    dni: form.querySelector("#dni").value,
    appointmentTime: form.querySelector("#time").value,
    appointmentDate: form.querySelector("#date").value,
  }

  try {
    const url = appointmentId ? `${API_BASE_URL}/${appointmentId}` : API_BASE_URL
    const method = appointmentId ? "PUT" : "POST"

    const response = await fetch(url, {
      method: method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(appointmentData),
    })

    if (!response.ok) {
      throw new Error("Error al guardar la cita")
    }

    // Cerrar modal
    const modalContainer = document.querySelector(".modal-container")
    document.body.removeChild(modalContainer)

    // Recargar citas para la fecha actual
    loadAppointmentsByDate(formatDateForAPI(currentDate))
  } catch (error) {
    console.error("Error:", error)
    alert("Error al guardar la cita")
  }
}
