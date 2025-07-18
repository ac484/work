import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { RoleManagementService, Role } from '../../core/services/iam/roles/role-management.service';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';
import { Firestore, doc, updateDoc } from '@angular/fire/firestore';
import { inject } from '@angular/core';
import { ALL_ROLE_IDS } from '../../core/services/iam/roles/role-init';
import { collectionData, CollectionReference, collection } from '@angular/fire/firestore';
import { ALL_PERMISSIONS } from '../../core/constants/permissions';

@Component({
  selector: 'app-role-management',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, FormsModule],
  template: `
    <h2>權限矩陣管理</h2>
    <form [formGroup]="roleForm" (ngSubmit)="addOrUpdateRole()" class="flex items-end gap-2 flex-wrap">
      <input formControlName="id" placeholder="角色名稱" required maxlength="20" />
      <input formControlName="description" placeholder="描述" maxlength="40" />
      <div class="flex gap-2 mb-1">
        <button type="submit" *ngIf="!isEditMode">新增角色</button>
        <button type="submit" *ngIf="isEditMode">儲存變更</button>
        <button type="button" (click)="resetRoleForm()">清空</button>
      </div>
      <div class="w-full mt-2">
        <label *ngFor="let perm of allPermissions" class="mr-2">
          <input type="checkbox" [value]="perm" (change)="togglePermission(perm, $event)"
            [checked]="roleForm.value.permissions.includes(perm)" />
          {{ perm }}
        </label>
      </div>
    </form>
    <hr />
    <table>
      <thead>
        <tr>
          <th>角色</th><th>描述</th><th>權限</th><th>操作</th>
        </tr>
      </thead>
      <tbody>
        <tr *ngFor="let role of roles$ | async">
          <td>{{ role.id }}</td>
          <td>{{ role.description }}</td>
          <td>{{ role.permissions.join(', ') }}</td>
          <td>
            <button (click)="editRole(role)">編輯</button>
            <button (click)="deleteRole(role.id)">刪除</button>
          </td>
        </tr>
      </tbody>
    </table>
    <hr />
    <h3>用戶角色指派</h3>
    <form [formGroup]="userRoleForm" (ngSubmit)="assignRolesToUser()">
      <input formControlName="uid" placeholder="用戶UID" required maxlength="40" />
      <div>
        <label *ngFor="let roleId of allRoleIds">
          <input type="checkbox" [value]="roleId" (change)="toggleUserRole(roleId, $event)"
            [checked]="userRoleForm.value.roles.includes(roleId)" />
          {{ roleId }}
        </label>
      </div>
      <button type="submit">指派角色</button>
    </form>
    <hr />
    <h3>用戶列表（直接指派角色）</h3>
    <table>
      <thead>
        <tr>
          <th>UID</th><th>Email</th><th>名稱</th><th>角色</th>
        </tr>
      </thead>
      <tbody>
        <tr *ngFor="let user of users$ | async">
          <td>{{ user.uid }}</td>
          <td>{{ user.email }}</td>
          <td>{{ user.displayName }}</td>
          <td>
            <select multiple [ngModel]="user.roles" (ngModelChange)="updateUserRoles(user.uid, $event)">
              <option *ngFor="let roleId of allRoleIds" [value]="roleId">{{ roleId }}</option>
            </select>
          </td>
        </tr>
      </tbody>
    </table>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RoleManagementComponent implements OnInit {
  roles$!: Observable<Role[]>;
  allPermissions = ALL_PERMISSIONS;
  roleForm: FormGroup;
  allRoleIds = ALL_ROLE_IDS;
  userRoleForm: FormGroup;
  private firestore = inject(Firestore);
  users$!: Observable<any[]>;
  private usersCol: CollectionReference = collection(this.firestore, 'users');
  isEditMode = false;

  constructor(private roleService: RoleManagementService, fb: FormBuilder) {
    this.roleForm = fb.group({
      id: [''],
      description: [''],
      permissions: [[]]
    });
    this.userRoleForm = fb.group({
      uid: [''],
      roles: [[]]
    });
  }

  ngOnInit() {
    this.roles$ = this.roleService.getAllRoles();
    this.users$ = collectionData(this.usersCol, { idField: 'uid' });
  }

  togglePermission(perm: string, event: Event) {
    const target = event.target as HTMLInputElement;
    const currentPerms = this.roleForm.get('permissions')?.value || [];
    if (target.checked) {
      if (!currentPerms.includes(perm)) {
        this.roleForm.get('permissions')?.setValue([...currentPerms, perm]);
      }
    } else {
      this.roleForm.get('permissions')?.setValue(currentPerms.filter((p: string) => p !== perm));
    }
  }

  addOrUpdateRole() {
    const formValue = this.roleForm.value;
    const role: Role = {
      id: formValue.id,
      description: formValue.description,
      permissions: formValue.permissions
    };
    this.roleService.upsertRole(role);
    this.resetRoleForm();
  }

  editRole(role: Role) {
    this.isEditMode = true;
    this.roleForm.patchValue({
      id: role.id,
      description: role.description,
      permissions: role.permissions
    });
  }

  resetRoleForm() {
    this.isEditMode = false;
    this.roleForm.reset({ id: '', description: '', permissions: [] });
  }

  deleteRole(roleId: string) {
    if (confirm(`確定要刪除角色 "${roleId}"？`)) {
      this.roleService.deleteRole(roleId);
    }
  }

  toggleUserRole(roleId: string, event: Event) {
    const target = event.target as HTMLInputElement;
    const currentRoles = this.userRoleForm.get('roles')?.value || [];
    if (target.checked) {
      if (!currentRoles.includes(roleId)) {
        this.userRoleForm.get('roles')?.setValue([...currentRoles, roleId]);
      }
    } else {
      this.userRoleForm.get('roles')?.setValue(currentRoles.filter((r: string) => r !== roleId));
    }
  }

  async assignRolesToUser() {
    const { uid, roles } = this.userRoleForm.value;
    if (uid && roles) {
      const userDoc = doc(this.firestore, 'users', uid);
      await updateDoc(userDoc, { roles });
      this.userRoleForm.reset({ uid: '', roles: [] });
    }
  }

  async updateUserRoles(uid: string, roles: any) {
    const userDoc = doc(this.firestore, 'users', uid);
    await updateDoc(userDoc, { roles: Array.isArray(roles) ? roles : [roles] });
  }

  focusRoleName() {
    // 輔助方法，可在需要時使用
  }
}
