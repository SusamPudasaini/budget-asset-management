
  const table = document.getElementById('info-Table');
  const addBtn = document.getElementById('addRowBtn');
  const recommendationText = document.getElementById('recommendationText');

  // update recommendation based on unique provinces selected
  function updateParagraph() {
    const selects = table.querySelectorAll('select');
    const selectedProvinces = new Set();

    selects.forEach(sel => {
      const selectedOption = sel.options[sel.selectedIndex];
      if (selectedOption && selectedOption.value) {
        // extract province name from option text: "Branch Name (Province Name)"
        const provinceMatch = selectedOption.textContent.match(/\(([^)]+)\)$/);
        if (provinceMatch) selectedProvinces.add(provinceMatch[1].trim());
      }
    });

	const provincesArray = Array.from(selectedProvinces); // convert Set to Array

	  if (provincesArray.length > 1) {
	    recommendationText.textContent =
	      "विभिन्न प्रदेश कार्यालयको सिफारिस अनुसार तपशिल अनुसारको सामान वा आवश्यक बजेट व्यवस्थाको लागि सिफारिस गरिएको व्यहोरा अनुरोध छ ।";
	  } else{
	    recommendationText.textContent =
	      provincesArray[0] + " कार्यालयको सिफारिस अनुसार तपशिल अनुसारको सामान वा आवश्यक बजेट व्यवस्थाको लागि सिफारिस गरिएको व्यहोरा अनुरोध छ ।";
	  }
}

  // make sure to call updateParagraph whenever a branch select changes
  function createBranchSelect(nameAttr) {
    const container = document.createElement("div");
    container.classList.add("branch-select-wrapper");

    const select = document.createElement("select");
    select.name = nameAttr;
    select.required = true;

    const defaultOption = document.createElement("option");
    defaultOption.value = "";
    defaultOption.disabled = true;
    defaultOption.selected = true;
    defaultOption.textContent = "-- शाखा चयन गर्नुहोस् --";
    select.appendChild(defaultOption);

    branches.forEach(b => {
      const opt = document.createElement("option");
      opt.value = b.branchCode;
      opt.textContent = `${b.branchNameNepali} (${b.provinceCode.provinceNameNepali})`;
      select.appendChild(opt);
    });
	


    const span = document.createElement("span");
    span.classList.add("branch-print-text");
    span.textContent = "";

    select.addEventListener("change", () => {
      span.textContent = select.options[select.selectedIndex].textContent;
      updateParagraph(); // update recommendation whenever selection changes
    });

    container.appendChild(select);
    container.appendChild(span);
    return container;
  }



   // add rows
   addBtn.addEventListener('click', () => {
     const rowCount = table.rows.length - 1; // minus header row
     const newRow = table.insertRow(table.rows.length);

     newRow.innerHTML = `
       <td style="font-family: 'Himali';">${rowCount + 1}</td>
       <td class="printable-input"></td>
       <td><input type="text" name="assetHistories[${rowCount}].itemDetails" class="printable-input" required></td>
       <td><input type="text" name="assetHistories[${rowCount}].quantity" class="printable-input quantity" required>थान</td>
       <td><input type="text" name="assetHistories[${rowCount}].amount" class="printable-input number" required>/-</td>
       <td><input type="text" name="assetHistories[${rowCount}].requestedAmount" class="printable-input number">/-</td>
	   <td><textarea name="assetHistories[${rowCount}].remark" class="printable-textarea"></textarea></td>
       <td><button type="button" class="removeRowBtn">-</button></td>
     `;

     // insert branch select into 2nd cell
     newRow.cells[1].appendChild(
       createBranchSelect(`assetHistories[${rowCount}].branch.branchCode`)
     );

     attachRemoveEvent(newRow.querySelector('.removeRowBtn'));
   });
   
   // remove rows
      
      document.querySelectorAll('.removeRowBtn').forEach(btn => attachRemoveEvent(btn));

      function attachRemoveEvent(btn) {
        btn.addEventListener('click', function() {
          const row = this.closest('tr');
          if (table.rows.length > 2) {
            row.remove();
            updateSerialNumbers();
            updateParagraph();
          } else {
            alert("Cannot remove all rows!");
          }
        });
      }
     


   // search function (by branchCode)
   document.getElementById("searchBtn").addEventListener("click", function() {
       const branchCode = document.getElementById("officeSearch").value.trim();

       if (!branchCode) {
         alert("कृपया शाखा चयन गर्नुहोस् !");
         return;
       }

       fetch(`/asset-application/recent-orders?branchCode=${encodeURIComponent(branchCode)}`)
         .then(response => response.json())
         .then(data => {
           console.log("Recent orders response:", data);
           const table = document.getElementById("recentOrdersTable");
           const tbody = table.querySelector("tbody");
           tbody.innerHTML = "";

           if (!Array.isArray(data) || data.length === 0) {
             tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;">No records found</td></tr>`;
           } else {
             data.forEach((item, index) => {
               const row = `
                 <tr>
                   <td>${index + 1}</td>
                   <td>${item.branch.branchNameNepali}</td>
                   <td>${item.itemDetails}</td>
                   <td>${item.quantity}</td>
                   <td>${item.amount}</td>
                 </tr>`;
               tbody.innerHTML += row;
             });
           }

           table.style.display = "table";
         })
         .catch(error => {
           console.error("Error fetching recent orders:", error);
           alert("Error loading data!");
         });
   });
