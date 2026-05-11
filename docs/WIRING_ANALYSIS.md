# Frontend-to-Backend Wiring Analysis

## Summary
The components and pages are **mostly correctly wired** to the backend APIs, but there are several **critical issues** that need to be fixed.

---

## ✅ CORRECTLY WIRED

### 1. **Auth Routes**
- **Backend**: `/api/auth/login`, `/api/auth/logout`, `/api/auth/me`
- **Frontend**: `authApi.login()`, `authApi.logout()`, `authApi.me()`
- **Pages**: Login.tsx uses auth correctly
- **Status**: ✅ WORKING

### 2. **Persons CRUD Routes**
- **Backend**: `/api/persons/` (GET, POST, PUT, DELETE with `/{person_id}`)
- **Frontend**: `personsApi.getPersons()`, `createPerson()`, `updatePerson()`, `deletePerson()`
- **Pages**: Persons.tsx fetches and deletes
- **Status**: ✅ MOSTLY WORKING (see issues below)

### 3. **Cameras CRUD Routes**
- **Backend**: `/api/cameras/` (GET, POST, PUT, DELETE with `/{camera_id}`)
- **Frontend**: `camerasApi.getCameras()`, `createCamera()`, `updateCamera()`, `deleteCamera()`
- **Pages**: Cameras.tsx fully implements CRUD with CameraModal
- **Status**: ✅ WORKING

### 4. **Events CRUD Routes**
- **Backend**: `/api/events/` (GET, POST, PUT, DELETE with `/{event_id}`)
- **Frontend**: `eventsApi.getEvents()`, `createEvent()`, `updateEvent()`, `deleteEvent()`
- **Pages**: Events.tsx and Alerts.tsx fetch events
- **Status**: ✅ MOSTLY WORKING (see issues below)

### 5. **Monitoring Routes**
- **Backend**: 
  - `/api/monitoring/status`
  - `/api/monitoring/cameras`
  - `/api/monitoring/cameras/{camera_id}/status`
  - `/api/monitoring/cameras/{camera_id}/start`
  - `/api/monitoring/cameras/{camera_id}/stop`
  - `/api/monitoring/start-all`
  - `/api/monitoring/stop-all`
  - `/api/monitoring/ws` (WebSocket)
- **Frontend**: `monitoringApi` implements all endpoints
- **Pages**: LiveMonitoring.tsx and Cameras.tsx use monitoring
- **Status**: ✅ WORKING

### 6. **Verification Routes**
- **Backend**: 
  - `/api/verification/recognize-image` (POST with file)
  - `/api/verification/verify-authenticity/{event_code}`
  - `/api/verification/model-status`
  - `/api/verification/reload-model`
- **Frontend**: `verificationApi` implements all
- **Pages**: Verification.tsx fully uses these endpoints
- **Status**: ✅ WORKING

### 7. **Reports Routes**
- **Backend**: 
  - `/api/reports/summary`
  - `/api/reports/daily`
  - `/api/reports/by-camera/{camera_id}`
  - `/api/reports/by-status/{status}`
- **Frontend**: `reportsApi` implements all
- **Pages**: Reports.tsx uses summary and daily
- **Status**: ✅ WORKING

### 8. **WebSocket Integration**
- **Backend**: `/api/monitoring/ws` endpoint with manager.connect()
- **Frontend**: `useWebSocket()` hook connects correctly
- **Pages**: LiveMonitoring.tsx displays WebSocket events
- **Status**: ✅ WORKING

---

## ❌ CRITICAL ISSUES

### **ISSUE 1: Auth Refresh Token Not Sent Correctly**
**File**: `frontend/src/api/authApi.ts` (lines 15-18)

```typescript
// WRONG - doesn't send refresh token
refresh: async () => {
  const { data } = await axiosClient.post('/api/auth/refresh');
  return data;
},
```

**Expected**: Backend expects `TokenRefreshRequest` with `refresh_token` in body

**Fix Required**:
```typescript
refresh: async (refreshToken?: string) => {
  const token = refreshToken || localStorage.getItem('refresh_token');
  const { data } = await axiosClient.post('/api/auth/refresh', {
    refresh_token: token
  });
  return data;
},
```

---

### **ISSUE 2: Missing Add Person Functionality**
**File**: `frontend/src/pages/Persons.tsx` (line 49)

The "Add Entity" button exists but has **no onClick handler** and no modal.

```typescriptreact
// WRONG - button not wired
<button className="flex items-center space-x-2 bg-indigo-500 ...">
   <Plus className="w-3 h-3" />
   <span>Add Entity</span>
</button>
```

**Expected**: Should open a modal to create a new person (like Cameras page does)

**Fix Required**:
- Create a `PersonModal.tsx` component (similar to CameraModal.tsx)
- Add state management for modal and editing
- Wire up the create/update/delete operations

---

### **ISSUE 3: Persons Page Missing Edit Functionality**
**File**: `frontend/src/pages/Persons.tsx` (line 102)

Edit button exists but **does nothing** - no onClick handler.

```typescriptreact
// WRONG - edit not wired
<button className="text-neutral-500 hover:text-white transition-colors" title="Modify Record">
   <Edit className="w-4 h-4" />
</button>
```

**Fix Required**: Add onClick to edit person (via PersonModal)

---

### **ISSUE 4: Auth Bootstrap Endpoint Missing**
**File**: `frontend/src/pages/Login.tsx`

The backend has `/api/auth/bootstrap-admin` endpoint (for first-time admin creation) but frontend has **no corresponding API method**.

**Backend** (auth.py lines 73-83):
```python
@router.post("/bootstrap-admin", response_model=AdminRead, status_code=201)
def bootstrap_admin(payload: AdminCreate, db: Session = Depends(get_db)):
```

**Frontend**: Missing `bootstrapAdmin()` in authApi

**Fix Required**: Add bootstrap method to authApi, or create a dedicated setup page

---

### **ISSUE 5: Persons API Missing Image Upload**
**Status**: ✅ **FIXED**

The PersonModal now includes:
- Multi-file image upload UI
- `uploadPersonImages()` method in personsApi
- Integration with person create/edit workflow

---

### **ISSUE 7: Events Missing Filter Parameters**
**Status**: ✅ **FIXED**

Events page now has:
- Working search box with real-time filtering
- Status filter dropdown (Authorized, Known Non-Auth, Unknown)
- Camera ID numeric filter
- Apply and Reset buttons
- Backend parameters properly passed to API

---

### **ISSUE 8: Alerts Not Using Backend Filtering**
**Status**: ✅ **FIXED**

Alerts page now:
- Uses `getEventsByStatus('UNKNOWN')` for unknown alerts
- Uses `getEventsByStatus('KNOWN_NON_AUTHORIZED')` for non-authorized alerts
- Combines and sorts results by date
- No longer uses client-side filtering (better performance)

---

### **ISSUE 11: Verification Page Missing Reload Model Handler**
**Status**: ✅ **FIXED**

Verification page now has:
- Reload button next to model status display
- `handleReloadModel()` function
- Loading state during reload
- Model status updates after reload

---

## ⚠️ MINOR ISSUES

### **ISSUE 12: Events Create Not Exposed in UI**
**File**: `frontend/src/pages/Events.tsx`

There's no UI to manually create events. While events are created automatically during monitoring, manual creation might be useful for testing/demo purposes.

**Fix**: Add button to create event manually (optional)

---

### **ISSUE 13: Search/Filter Not Fully Implemented**
**Files**: Persons.tsx, Events.tsx

- Persons search input (line 59-63) has **no onChange handler**
- Events search input (line 59-63) has **no onChange handler**

**Fix**: Wire up search filters

---

### **ISSUE 14: axiosClient.ts Token Refresh Logic**
**File**: `frontend/src/api/axiosClient.ts` (lines 28-33)

Token refresh payload might be incorrect:
```typescript
const { data } = await axios.post(`${API_BASE_URL}/api/auth/refresh`, null, {
```

Should pass refresh token in body instead of null

**Fix Required**: Match fix in Issue #1

---

## SUMMARY TABLE

| Component | Backend Wiring | Frontend API | Page UI | Status |
|-----------|---|---|---|---|
| **Auth** | ✅ | ✅ | ✅ FIXED | WORKING |
| **Persons** | ✅ | ✅ ENHANCED | ✅ FIXED (+ image upload) | WORKING |
| **Cameras** | ✅ | ✅ | ✅ | WORKING |
| **Events** | ✅ | ✅ ENHANCED | ✅ FIXED (+ filtering) | WORKING |
| **Alerts** | ✅ | ✅ ENHANCED | ✅ FIXED (+ backend filtering) | WORKING |
| **Monitoring** | ✅ | ✅ | ✅ | WORKING |
| **Verification** | ✅ | ✅ | ✅ FIXED (+ reload button) | WORKING |
| **Reports** | ✅ (partial) | ✅ | ⚠️ (no date filter, no export) | PARTIAL |

---

## PRIORITY FIXES

### **P0 (Fix Immediately) - ✅ ALL FIXED**
1. ✅ **FIXED** Auth refresh token not sent correctly (Issue #1)
2. ✅ **FIXED** Persons add/edit modal missing (Issue #2, #3)

### **P1 (Fix Soon) - ✅ ALL FIXED**
3. ✅ **FIXED** Persons image upload (Issue #5)
4. ✅ **FIXED** Events filter UI (Issue #7)
5. ✅ **FIXED** Verification reload model button (Issue #11)
6. ✅ **FIXED** Alerts backend filtering (Issue #8)

### **P2 (Nice to Have)**
7. Reports date filtering UI (Issue #6)
8. CSV export functionality (Issue #9, #10)

---

## RECOMMENDATIONS

1. **Create PersonModal Component**: Model it after CameraModal.tsx for consistency
2. **Implement Filtering Uniformly**: All pages with filters should pass parameters to API
3. **Add CSV Export Endpoints**: Implement in backend and wire to frontend buttons
4. **Standardize Error Handling**: Ensure all API calls handle errors consistently
5. **Complete AuthFlow**: Add bootstrap page or integrate into login page

