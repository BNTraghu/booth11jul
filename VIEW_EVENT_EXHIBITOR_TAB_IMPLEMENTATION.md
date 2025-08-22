# View Event Exhibitor Tab Implementation

## 🎯 **Objective**

Add an Exhibitor tab to the View Event modal that displays selected exhibitors in a read-only tabular format, similar to the Edit Event Exhibitor tab but without editing capabilities.

## ✅ **Intended Changes**

### 1. **View Modal Tab Navigation**
Add tab navigation to the View Event modal with:
- **Event Details Tab**: Shows all current event information
- **Exhibitors Tab**: Shows selected exhibitors in table format

```typescript
{/* Tab Navigation */}
<div className="mt-4 border-b border-gray-200">
  <nav className="-mb-px flex space-x-8">
    <button
      onClick={() => setViewActiveTab('event')}
      className={`py-2 px-1 border-b-2 font-medium text-sm ${
        viewActiveTab === 'event'
          ? 'border-blue-500 text-blue-600'
          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
      }`}
    >
      <CalendarIcon className="h-4 w-4 inline mr-2" />
      Event Details
    </button>
    <button
      onClick={() => setViewActiveTab('exhibitor')}
      className={`py-2 px-1 border-b-2 font-medium text-sm ${
        viewActiveTab === 'exhibitor'
          ? 'border-blue-500 text-blue-600'
          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
      }`}
    >
      <User className="h-4 w-4 inline mr-2" />
      Exhibitors ({selectedEvent.exhibitors?.length || 0})
    </button>
  </nav>
</div>
```

### 2. **State Variable Addition**
Add state for managing view modal tabs:

```typescript
const [viewActiveTab, setViewActiveTab] = useState<'event' | 'exhibitor'>('event');
```

### 3. **Tab Content Structure**
Wrap existing event content in Event tab and add Exhibitor tab:

```typescript
{/* Tab Content */}
{viewActiveTab === 'event' && (
  <div className="p-6 space-y-6">
    {/* All existing event content */}
  </div>
)}

{/* Exhibitor Tab */}
{viewActiveTab === 'exhibitor' && (
  <div className="p-6 space-y-6">
    {/* Exhibitor table content */}
  </div>
)}
```

### 4. **Exhibitor Tab Content**
Display selected exhibitors in a read-only table:

```typescript
{/* Exhibitor Tab */}
{viewActiveTab === 'exhibitor' && (
  <div className="p-6 space-y-6">
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 flex items-center">
        <User className="h-5 w-5 mr-2" />
        Event Exhibitors
      </h3>
      
      {selectedEvent.exhibitors && selectedEvent.exhibitors.length > 0 ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              {selectedEvent.exhibitors.length} exhibitor(s) assigned to this event
            </p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Company
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact Person
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Phone
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {exhibitors
                  .filter(exhibitor => selectedEvent.exhibitors?.includes(exhibitor.id))
                  .map((exhibitor) => (
                  <tr key={exhibitor.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">
                        {exhibitor.companyName || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-gray-900">
                        {`${exhibitor.firstName || ''} ${exhibitor.lastName || ''}`.trim() || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-gray-900">{exhibitor.email || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-gray-900">{exhibitor.phone || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-gray-900">{exhibitor.category || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant={exhibitor.status === 'completed' || exhibitor.status === 'checked_in' ? 'success' : 'default'}>
                        {exhibitor.status || 'pending'}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No exhibitors assigned to this event</p>
          <p className="text-sm text-gray-500">Exhibitors can be assigned when editing the event</p>
        </div>
      )}
    </div>
  </div>
)}
```

### 5. **Update closeModals Function**
Reset viewActiveTab when closing modals:

```typescript
const closeModals = () => {
  setShowViewModal(false);
  setShowEditModal(false);
  setShowDeleteModal(false);
  setSelectedEvent(null);
  setEditFormData(null);
  setEditErrors({});
  setEditActiveTab('event');
  setViewActiveTab('event'); // Add this line
  setSelectedExhibitorsForEdit([]);
  setExhibitorSearchTerm('');
};
```

## 🚨 **Current Issues**

The implementation has several JSX structure issues that need to be resolved:

1. **JSX Element Mismatch**: Line 665 shows "JSX element 'div' has no corresponding closing tag"
2. **Unexpected Tokens**: Multiple syntax errors around lines 1273, 1370, 1371
3. **Missing Closing Tags**: Several JSX elements are not properly closed
4. **Type Comparison Issues**: Status comparisons causing type errors

## 🔧 **Required Fixes**

### **Fix 1: Proper JSX Structure**
Ensure all JSX elements are properly nested and closed:

```typescript
{/* View Event Modal */}
{showViewModal && selectedEvent && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
      {/* Header with Tabs */}
      <div className="p-6 border-b border-gray-200">
        {/* Title and Close Button */}
        {/* Tab Navigation */}
      </div>
      
      {/* Tab Content */}
      {viewActiveTab === 'event' && (
        <div className="p-6 space-y-6">
          {/* Event content */}
        </div>
      )}
      
      {viewActiveTab === 'exhibitor' && (
        <div className="p-6 space-y-6">
          {/* Exhibitor content */}
        </div>
      )}
      
      {/* Footer */}
      <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
        {/* Buttons */}
      </div>
    </div>
  </div>
)}
```

### **Fix 2: Type Safety**
Update status comparisons to handle all possible values:

```typescript
<Badge variant={
  exhibitor.status === 'completed' || 
  exhibitor.status === 'checked_in' || 
  exhibitor.status === 'confirmed' 
    ? 'success' 
    : 'default'
}>
  {exhibitor.status || 'pending'}
</Badge>
```

### **Fix 3: State Management**
Ensure proper state initialization and cleanup:

```typescript
// Initialize viewActiveTab
const [viewActiveTab, setViewActiveTab] = useState<'event' | 'exhibitor'>('event');

// Reset in closeModals
const closeModals = () => {
  // ... other resets
  setViewActiveTab('event');
};
```

## 📝 **Files to Modify**

1. **`src/pages/Events.tsx`** - Add View Event Exhibitor tab functionality

## 🎯 **Expected Result**

After proper implementation, users will be able to:

1. **View Event Details**: See all event information in the Event Details tab
2. **View Exhibitors**: Switch to Exhibitors tab to see selected exhibitors in a table
3. **Read-Only Display**: View exhibitor information without editing capabilities
4. **Tab Navigation**: Easily switch between Event Details and Exhibitors views
5. **Consistent UI**: Maintain the same design patterns as Edit Event modal

## ⚠️ **Implementation Notes**

- **Read-Only**: The Exhibitor tab should be purely for viewing, no editing
- **Data Filtering**: Only show exhibitors that are actually assigned to the event
- **Empty State**: Handle cases where no exhibitors are assigned
- **Responsive Design**: Ensure table is scrollable on smaller screens
- **State Management**: Properly manage tab state and cleanup

The View Event modal will provide a comprehensive view of both event details and assigned exhibitors in an organized, tabbed interface! 🚀✨
